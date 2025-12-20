import { ChangeDetectionStrategy, Component, EventEmitter, Inject, Input, Optional, Output, PLATFORM_ID, ViewChild, } from "@angular/core";
import { isPlatformBrowser, CommonModule } from "@angular/common";
import { isLTR, isIOS } from "./utils";
import * as i0 from "@angular/core";
import * as i1 from "./sidebar-container.component";
import * as i2 from "@angular/common";
export class Sidebar {
    _container;
    _ref;
    // `openedChange` allows for "2-way" data binding
    opened = false;
    openedChange = new EventEmitter();
    mode = "over";
    dock = false;
    dockedSize = "0px";
    position = "start";
    animate = true;
    autoCollapseHeight;
    autoCollapseWidth;
    autoCollapseOnInit = true;
    sidebarClass;
    ariaLabel;
    trapFocus = false;
    autoFocus = true;
    showBackdrop = false;
    closeOnClickBackdrop = false;
    closeOnClickOutside = false;
    keyClose = false;
    key = "Escape"; // Default to Escape key
    onContentInit = new EventEmitter();
    onOpenStart = new EventEmitter();
    onOpened = new EventEmitter();
    onCloseStart = new EventEmitter();
    onClosed = new EventEmitter();
    onTransitionEnd = new EventEmitter();
    onModeChange = new EventEmitter();
    onPositionChange = new EventEmitter();
    /** @internal */
    _onRerender = new EventEmitter();
    /** @internal */
    _elSidebar;
    _focusableElementsString = "a[href], area[href], input:not([disabled]), select:not([disabled])," +
        "textarea:not([disabled]), button:not([disabled]), iframe, object, embed, [tabindex], [contenteditable]";
    _focusableElements;
    _focusedBeforeOpen = null;
    _tabIndexAttr = "__tabindex__";
    _tabIndexIndicatorAttr = "__ngsidebar-tabindex__";
    _wasCollapsed = false;
    // Delay initial animation (issues #59, #112)
    _shouldAnimate = false;
    _clickEvent = "click";
    _onClickOutsideAttached = false;
    _onKeyDownAttached = false;
    _onResizeAttached = false;
    _isBrowser;
    constructor(_container, _ref, platformId) {
        this._container = _container;
        this._ref = _ref;
        if (!this._container) {
            throw new Error("<ng-sidebar> must be inside a <ng-sidebar-container>. " +
                "See https://github.com/arkon/ng-sidebar#usage for more info.");
        }
        this._isBrowser = isPlatformBrowser(platformId);
        // Handle taps in iOS
        if (this._isBrowser && isIOS() && !("onclick" in window)) {
            this._clickEvent = "touchstart";
        }
        this._normalizePosition();
        this.open = this.open.bind(this);
        this.close = this.close.bind(this);
        this._onTransitionEnd = this._onTransitionEnd.bind(this);
        this._onFocusTrap = this._onFocusTrap.bind(this);
        this._onClickOutside = this._onClickOutside.bind(this);
        this._onKeyDown = this._onKeyDown.bind(this);
        this._collapse = this._collapse.bind(this);
    }
    ngOnInit() {
        if (!this._isBrowser) {
            return;
        }
        if (this.animate) {
            this._shouldAnimate = true;
            this.animate = false;
        }
        this._container._addSidebar(this);
        if (this.autoCollapseOnInit) {
            this._collapse();
        }
    }
    ngAfterContentInit() {
        this.onContentInit.emit();
    }
    ngOnChanges(changes) {
        if (!this._isBrowser) {
            return;
        }
        if (changes["animate"] && this._shouldAnimate) {
            this._shouldAnimate = changes["animate"].currentValue;
        }
        if (changes["closeOnClickOutside"]) {
            if (changes["closeOnClickOutside"].currentValue) {
                this._initCloseClickListener();
            }
            else {
                this._destroyCloseClickListener();
            }
        }
        if (changes["keyClose"]) {
            if (changes["keyClose"].currentValue) {
                this._initCloseKeyDownListener();
            }
            else {
                this._destroyCloseKeyDownListener();
            }
        }
        if (changes["position"]) {
            // Handle "start" and "end" aliases
            this._normalizePosition();
            // Emit change in timeout to allow for position change to be rendered first
            setTimeout(() => {
                this.onPositionChange.emit(changes["position"].currentValue);
            });
        }
        if (changes["mode"]) {
            setTimeout(() => {
                this.onModeChange.emit(changes["mode"].currentValue);
            });
        }
        if (changes["dock"]) {
            this.triggerRerender();
        }
        if (changes["opened"]) {
            if (this._shouldAnimate) {
                this.animate = true;
                this._shouldAnimate = false;
            }
            if (changes["opened"].currentValue) {
                this.open();
            }
            else {
                this.close();
            }
        }
        if (changes["autoCollapseHeight"] || changes["autoCollapseWidth"]) {
            this._initCollapseListeners();
        }
    }
    ngOnDestroy() {
        if (!this._isBrowser) {
            return;
        }
        this._destroyCloseListeners();
        this._destroyCollapseListeners();
        this._container._removeSidebar(this);
    }
    // Sidebar toggling
    // ==============================================================================================
    /**
     * Opens the sidebar and emits the appropriate events.
     */
    open() {
        if (!this._isBrowser) {
            return;
        }
        this.opened = true;
        this.openedChange.emit(true);
        this.onOpenStart.emit();
        this._ref.detectChanges();
        setTimeout(() => {
            if (this.animate && !this._isModeSlide) {
                this._elSidebar.nativeElement.addEventListener("transitionend", this._onTransitionEnd);
            }
            else {
                this._setFocused();
                this._initCloseListeners();
                if (this.opened) {
                    this.onOpened.emit();
                }
            }
        });
    }
    /**
     * Closes the sidebar and emits the appropriate events.
     */
    close() {
        if (!this._isBrowser) {
            return;
        }
        this.opened = false;
        this.openedChange.emit(false);
        this.onCloseStart.emit();
        this._ref.detectChanges();
        setTimeout(() => {
            if (this.animate && !this._isModeSlide) {
                this._elSidebar.nativeElement.addEventListener("transitionend", this._onTransitionEnd);
            }
            else {
                this._setFocused();
                this._destroyCloseListeners();
                if (!this.opened) {
                    this.onClosed.emit();
                }
            }
        });
    }
    /**
     * Manually trigger a re-render of the container. Useful if the sidebar contents might change.
     */
    triggerRerender() {
        if (!this._isBrowser) {
            return;
        }
        setTimeout(() => {
            this._onRerender.emit();
        });
    }
    /**
     * @internal
     *
     * Computes the transform styles for the sidebar template.
     *
     * @return {CSSStyleDeclaration} The transform styles, with the WebKit-prefixed version as well.
     */
    _getStyle() {
        let transformStyle = "";
        // Hides sidebar off screen when closed
        if (!this.opened) {
            const transformDir = "translate" + (this._isLeftOrRight ? "X" : "Y");
            let translateAmt = `${this._isLeftOrTop ? "-" : ""}100%`;
            transformStyle = `${transformDir}(${translateAmt})`;
            // Docked mode: partially remains open
            // Note that using `calc(...)` within `transform(...)` doesn't work in IE
            if (this.dock &&
                this._dockedSize > 0 &&
                !(this._isModeSlide && this.opened)) {
                transformStyle += ` ${transformDir}(${this._isLeftOrTop ? "+" : "-"}${this.dockedSize})`;
            }
        }
        return {
            webkitTransform: transformStyle,
            transform: transformStyle,
        };
    }
    /**
     * @internal
     *
     * Handles the `transitionend` event on the sidebar to emit the onOpened/onClosed events after the transform
     * transition is completed.
     */
    _onTransitionEnd(e) {
        if (e.target === this._elSidebar.nativeElement &&
            e.propertyName.endsWith("transform")) {
            this._setFocused();
            if (this.opened) {
                this._initCloseListeners();
                this.onOpened.emit();
            }
            else {
                this._destroyCloseListeners();
                this.onClosed.emit();
            }
            this.onTransitionEnd.emit();
            this._elSidebar.nativeElement.removeEventListener("transitionend", this._onTransitionEnd);
        }
    }
    // Focus on open/close
    // ==============================================================================================
    /**
     * Returns whether focus should be trapped within the sidebar.
     *
     * @return {boolean} Trap focus inside sidebar.
     */
    get _shouldTrapFocus() {
        return this.opened && this.trapFocus;
    }
    /**
     * Sets focus to the first focusable element inside the sidebar.
     */
    _focusFirstItem() {
        if (this._focusableElements && this._focusableElements.length > 0) {
            this._focusableElements[0].focus();
        }
    }
    /**
     * Loops focus back to the start of the sidebar if set to do so.
     */
    _onFocusTrap(e) {
        if (this._shouldTrapFocus &&
            !this._elSidebar.nativeElement.contains(e.target)) {
            this._focusFirstItem();
        }
    }
    /**
     * Handles the ability to focus sidebar elements when it's open/closed to ensure that the sidebar is inert when
     * appropriate.
     */
    _setFocused() {
        this._focusableElements = Array.from(this._elSidebar.nativeElement.querySelectorAll(this._focusableElementsString));
        if (this.opened) {
            this._focusedBeforeOpen = document.activeElement;
            // Restore focusability, with previous tabindex attributes
            for (const el of this._focusableElements) {
                const prevTabIndex = el.getAttribute(this._tabIndexAttr);
                const wasTabIndexSet = el.getAttribute(this._tabIndexIndicatorAttr) !== null;
                if (prevTabIndex !== null) {
                    el.setAttribute("tabindex", prevTabIndex);
                    el.removeAttribute(this._tabIndexAttr);
                }
                else if (wasTabIndexSet) {
                    el.removeAttribute("tabindex");
                    el.removeAttribute(this._tabIndexIndicatorAttr);
                }
            }
            if (this.autoFocus) {
                this._focusFirstItem();
            }
            document.addEventListener("focus", this._onFocusTrap, true);
        }
        else {
            // Manually make all focusable elements unfocusable, saving existing tabindex attributes
            for (const el of this._focusableElements) {
                const existingTabIndex = el.getAttribute("tabindex");
                el.setAttribute("tabindex", "-1");
                el.setAttribute(this._tabIndexIndicatorAttr, "");
                if (existingTabIndex !== null) {
                    el.setAttribute(this._tabIndexAttr, existingTabIndex);
                }
            }
            document.removeEventListener("focus", this._onFocusTrap, true);
            // Set focus back to element before the sidebar was opened
            if (this._focusedBeforeOpen && this.autoFocus && this._isModeOver) {
                this._focusedBeforeOpen.focus();
                this._focusedBeforeOpen = null;
            }
        }
    }
    // Close event handlers
    // ==============================================================================================
    /**
     * Initializes event handlers for the closeOnClickOutside and keyClose options.
     */
    _initCloseListeners() {
        this._initCloseClickListener();
        this._initCloseKeyDownListener();
    }
    _initCloseClickListener() {
        // In a timeout so that things render first
        setTimeout(() => {
            if (this.opened &&
                this.closeOnClickOutside &&
                !this._onClickOutsideAttached) {
                document.addEventListener(this._clickEvent, this._onClickOutside);
                this._onClickOutsideAttached = true;
            }
        });
    }
    _initCloseKeyDownListener() {
        // In a timeout so that things render first
        setTimeout(() => {
            if (this.opened && this.keyClose && !this._onKeyDownAttached) {
                document.addEventListener("keydown", this._onKeyDown);
                this._onKeyDownAttached = true;
            }
        });
    }
    /**
     * Destroys all event handlers from _initCloseListeners.
     */
    _destroyCloseListeners() {
        this._destroyCloseClickListener();
        this._destroyCloseKeyDownListener();
    }
    _destroyCloseClickListener() {
        if (this._onClickOutsideAttached) {
            document.removeEventListener(this._clickEvent, this._onClickOutside);
            this._onClickOutsideAttached = false;
        }
    }
    _destroyCloseKeyDownListener() {
        if (this._onKeyDownAttached) {
            document.removeEventListener("keydown", this._onKeyDown);
            this._onKeyDownAttached = false;
        }
    }
    /**
     * Handles `click` events on anything while the sidebar is open for the closeOnClickOutside option.
     * Programatically closes the sidebar if a click occurs outside the sidebar.
     *
     * @param e {MouseEvent} Mouse click event.
     */
    _onClickOutside(e) {
        if (this._onClickOutsideAttached &&
            this._elSidebar &&
            !this._elSidebar.nativeElement.contains(e.target)) {
            this.close();
        }
    }
    /**
     * Handles the `keydown` event for the keyClose option.
     *
     * @param e {KeyboardEvent} Normalized keydown event.
     */
    _onKeyDown(e) {
        if (e.key === this.key) {
            this.close();
        }
    }
    // Auto collapse handlers
    // ==============================================================================================
    _initCollapseListeners() {
        if (this.autoCollapseHeight || this.autoCollapseWidth) {
            // In a timeout so that things render first
            setTimeout(() => {
                if (!this._onResizeAttached) {
                    window.addEventListener("resize", this._collapse);
                    this._onResizeAttached = true;
                }
            });
        }
    }
    _destroyCollapseListeners() {
        if (this._onResizeAttached) {
            window.removeEventListener("resize", this._collapse);
            this._onResizeAttached = false;
        }
    }
    _collapse() {
        const winHeight = window.innerHeight;
        const winWidth = window.innerWidth;
        if (this.autoCollapseHeight) {
            if (winHeight <= this.autoCollapseHeight && this.opened) {
                this._wasCollapsed = true;
                this.close();
            }
            else if (winHeight > this.autoCollapseHeight && this._wasCollapsed) {
                this.open();
                this._wasCollapsed = false;
            }
        }
        if (this.autoCollapseWidth) {
            if (winWidth <= this.autoCollapseWidth && this.opened) {
                this._wasCollapsed = true;
                this.close();
            }
            else if (winWidth > this.autoCollapseWidth && this._wasCollapsed) {
                this.open();
                this._wasCollapsed = false;
            }
        }
    }
    // Helpers
    // ==============================================================================================
    /**
     * @internal
     *
     * Returns the rendered height of the sidebar (or the docked size).
     * This is used in the sidebar container.
     *
     * @return {number} Height of sidebar.
     */
    get _height() {
        if (this._elSidebar.nativeElement) {
            return this._isDocked
                ? this._dockedSize
                : this._elSidebar.nativeElement.offsetHeight;
        }
        return 0;
    }
    /**
     * @internal
     *
     * Returns the rendered width of the sidebar (or the docked size).
     * This is used in the sidebar container.
     *
     * @return {number} Width of sidebar.
     */
    get _width() {
        if (this._elSidebar.nativeElement) {
            return this._isDocked
                ? this._dockedSize
                : this._elSidebar.nativeElement.offsetWidth;
        }
        return 0;
    }
    /**
     * @internal
     *
     * Returns the docked size as a number.
     *
     * @return {number} Docked size.
     */
    get _dockedSize() {
        return parseFloat(this.dockedSize);
    }
    /**
     * @internal
     *
     * Returns whether the sidebar is over mode.
     *
     * @return {boolean} Sidebar's mode is "over".
     */
    get _isModeOver() {
        return this.mode === "over";
    }
    /**
     * @internal
     *
     * Returns whether the sidebar is push mode.
     *
     * @return {boolean} Sidebar's mode is "push".
     */
    get _isModePush() {
        return this.mode === "push";
    }
    /**
     * @internal
     *
     * Returns whether the sidebar is slide mode.
     *
     * @return {boolean} Sidebar's mode is "slide".
     */
    get _isModeSlide() {
        return this.mode === "slide";
    }
    /**
     * @internal
     *
     * Returns whether the sidebar is "docked" -- i.e. it is closed but in dock mode.
     *
     * @return {boolean} Sidebar is docked.
     */
    get _isDocked() {
        return !!(this.dock && this._dockedSize > 0 && !this.opened);
    }
    /**
     * @internal
     *
     * Returns whether the sidebar is positioned at the left or top.
     *
     * @return {boolean} Sidebar is positioned at the left or top.
     */
    get _isLeftOrTop() {
        return this.position === "left" || this.position === "top";
    }
    /**
     * @internal
     *
     * Returns whether the sidebar is positioned at the left or right.
     *
     * @return {boolean} Sidebar is positioned at the left or right.
     */
    get _isLeftOrRight() {
        return this.position === "left" || this.position === "right";
    }
    /**
     * @internal
     *
     * Returns whether the sidebar is inert -- i.e. the contents cannot be focused.
     *
     * @return {boolean} Sidebar is inert.
     */
    get _isInert() {
        return !this.opened && !this.dock;
    }
    /**
     * "Normalizes" position. For example, "start" would be "left" if the page is LTR.
     */
    _normalizePosition() {
        const ltr = isLTR();
        if (this.position === "start") {
            this.position = ltr ? "left" : "right";
        }
        else if (this.position === "end") {
            this.position = ltr ? "right" : "left";
        }
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.2.14", ngImport: i0, type: Sidebar, deps: [{ token: i1.SidebarContainer, optional: true }, { token: i0.ChangeDetectorRef }, { token: PLATFORM_ID }], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "18.2.14", type: Sidebar, isStandalone: true, selector: "ng-sidebar", inputs: { opened: "opened", mode: "mode", dock: "dock", dockedSize: "dockedSize", position: "position", animate: "animate", autoCollapseHeight: "autoCollapseHeight", autoCollapseWidth: "autoCollapseWidth", autoCollapseOnInit: "autoCollapseOnInit", sidebarClass: "sidebarClass", ariaLabel: "ariaLabel", trapFocus: "trapFocus", autoFocus: "autoFocus", showBackdrop: "showBackdrop", closeOnClickBackdrop: "closeOnClickBackdrop", closeOnClickOutside: "closeOnClickOutside", keyClose: "keyClose", key: "key" }, outputs: { openedChange: "openedChange", onContentInit: "onContentInit", onOpenStart: "onOpenStart", onOpened: "onOpened", onCloseStart: "onCloseStart", onClosed: "onClosed", onTransitionEnd: "onTransitionEnd", onModeChange: "onModeChange", onPositionChange: "onPositionChange", _onRerender: "_onRerender" }, viewQueries: [{ propertyName: "_elSidebar", first: true, predicate: ["sidebar"], descendants: true }], usesOnChanges: true, ngImport: i0, template: `
    <aside
      #sidebar
      role="complementary"
      [attr.aria-hidden]="!opened"
      [attr.aria-label]="ariaLabel"
      class="ng-sidebar ng-sidebar--{{
        opened ? 'opened' : 'closed'
      }} ng-sidebar--{{ position }} ng-sidebar--{{ mode }}"
      [class.ng-sidebar--docked]="_isDocked"
      [class.ng-sidebar--inert]="_isInert"
      [class.ng-sidebar--animate]="animate"
      [ngClass]="sidebarClass"
      [ngStyle]="_getStyle()"
    >
      <ng-content></ng-content>
    </aside>
  `, isInline: true, styles: [".ng-sidebar{-webkit-overflow-scrolling:touch;overflow:auto;pointer-events:auto;position:absolute;touch-action:auto;will-change:initial;z-index:2}.ng-sidebar--left{bottom:0;left:0;top:0}.ng-sidebar--right{bottom:0;right:0;top:0}.ng-sidebar--top{left:0;right:0;top:0}.ng-sidebar--bottom{bottom:0;left:0;right:0}.ng-sidebar--inert{pointer-events:none;touch-action:none;will-change:transform}.ng-sidebar--animate{-webkit-transition:-webkit-transform .3s cubic-bezier(0,0,.3,1);transition:transform .3s cubic-bezier(0,0,.3,1)}\n"], dependencies: [{ kind: "ngmodule", type: CommonModule }, { kind: "directive", type: i2.NgClass, selector: "[ngClass]", inputs: ["class", "ngClass"] }, { kind: "directive", type: i2.NgStyle, selector: "[ngStyle]", inputs: ["ngStyle"] }], changeDetection: i0.ChangeDetectionStrategy.OnPush });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.2.14", ngImport: i0, type: Sidebar, decorators: [{
            type: Component,
            args: [{ selector: "ng-sidebar", template: `
    <aside
      #sidebar
      role="complementary"
      [attr.aria-hidden]="!opened"
      [attr.aria-label]="ariaLabel"
      class="ng-sidebar ng-sidebar--{{
        opened ? 'opened' : 'closed'
      }} ng-sidebar--{{ position }} ng-sidebar--{{ mode }}"
      [class.ng-sidebar--docked]="_isDocked"
      [class.ng-sidebar--inert]="_isInert"
      [class.ng-sidebar--animate]="animate"
      [ngClass]="sidebarClass"
      [ngStyle]="_getStyle()"
    >
      <ng-content></ng-content>
    </aside>
  `, changeDetection: ChangeDetectionStrategy.OnPush, standalone: true, imports: [CommonModule], styles: [".ng-sidebar{-webkit-overflow-scrolling:touch;overflow:auto;pointer-events:auto;position:absolute;touch-action:auto;will-change:initial;z-index:2}.ng-sidebar--left{bottom:0;left:0;top:0}.ng-sidebar--right{bottom:0;right:0;top:0}.ng-sidebar--top{left:0;right:0;top:0}.ng-sidebar--bottom{bottom:0;left:0;right:0}.ng-sidebar--inert{pointer-events:none;touch-action:none;will-change:transform}.ng-sidebar--animate{-webkit-transition:-webkit-transform .3s cubic-bezier(0,0,.3,1);transition:transform .3s cubic-bezier(0,0,.3,1)}\n"] }]
        }], ctorParameters: () => [{ type: i1.SidebarContainer, decorators: [{
                    type: Optional
                }] }, { type: i0.ChangeDetectorRef }, { type: Object, decorators: [{
                    type: Inject,
                    args: [PLATFORM_ID]
                }] }], propDecorators: { opened: [{
                type: Input
            }], openedChange: [{
                type: Output
            }], mode: [{
                type: Input
            }], dock: [{
                type: Input
            }], dockedSize: [{
                type: Input
            }], position: [{
                type: Input
            }], animate: [{
                type: Input
            }], autoCollapseHeight: [{
                type: Input
            }], autoCollapseWidth: [{
                type: Input
            }], autoCollapseOnInit: [{
                type: Input
            }], sidebarClass: [{
                type: Input
            }], ariaLabel: [{
                type: Input
            }], trapFocus: [{
                type: Input
            }], autoFocus: [{
                type: Input
            }], showBackdrop: [{
                type: Input
            }], closeOnClickBackdrop: [{
                type: Input
            }], closeOnClickOutside: [{
                type: Input
            }], keyClose: [{
                type: Input
            }], key: [{
                type: Input
            }], onContentInit: [{
                type: Output
            }], onOpenStart: [{
                type: Output
            }], onOpened: [{
                type: Output
            }], onCloseStart: [{
                type: Output
            }], onClosed: [{
                type: Output
            }], onTransitionEnd: [{
                type: Output
            }], onModeChange: [{
                type: Output
            }], onPositionChange: [{
                type: Output
            }], _onRerender: [{
                type: Output
            }], _elSidebar: [{
                type: ViewChild,
                args: ["sidebar", { static: false }]
            }] } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2lkZWJhci5jb21wb25lbnQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvc2lkZWJhci5jb21wb25lbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUVMLHVCQUF1QixFQUV2QixTQUFTLEVBRVQsWUFBWSxFQUNaLE1BQU0sRUFDTixLQUFLLEVBSUwsUUFBUSxFQUNSLE1BQU0sRUFDTixXQUFXLEVBRVgsU0FBUyxHQUNWLE1BQU0sZUFBZSxDQUFDO0FBQ3ZCLE9BQU8sRUFBRSxpQkFBaUIsRUFBRSxZQUFZLEVBQUUsTUFBTSxpQkFBaUIsQ0FBQztBQUdsRSxPQUFPLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxNQUFNLFNBQVMsQ0FBQzs7OztBQTBFdkMsTUFBTSxPQUFPLE9BQU87SUFrRUk7SUFDWjtJQWxFVixpREFBaUQ7SUFDeEMsTUFBTSxHQUFZLEtBQUssQ0FBQztJQUN2QixZQUFZLEdBQTBCLElBQUksWUFBWSxFQUFXLENBQUM7SUFFbkUsSUFBSSxHQUE4QixNQUFNLENBQUM7SUFDekMsSUFBSSxHQUFZLEtBQUssQ0FBQztJQUN0QixVQUFVLEdBQVcsS0FBSyxDQUFDO0lBQzNCLFFBQVEsR0FDZixPQUFPLENBQUM7SUFDRCxPQUFPLEdBQVksSUFBSSxDQUFDO0lBRXhCLGtCQUFrQixDQUFVO0lBQzVCLGlCQUFpQixDQUFVO0lBQzNCLGtCQUFrQixHQUFZLElBQUksQ0FBQztJQUVuQyxZQUFZLENBQVU7SUFFdEIsU0FBUyxDQUFVO0lBQ25CLFNBQVMsR0FBWSxLQUFLLENBQUM7SUFDM0IsU0FBUyxHQUFZLElBQUksQ0FBQztJQUUxQixZQUFZLEdBQVksS0FBSyxDQUFDO0lBQzlCLG9CQUFvQixHQUFZLEtBQUssQ0FBQztJQUN0QyxtQkFBbUIsR0FBWSxLQUFLLENBQUM7SUFFckMsUUFBUSxHQUFZLEtBQUssQ0FBQztJQUMxQixHQUFHLEdBQVcsUUFBUSxDQUFDLENBQUMsd0JBQXdCO0lBRS9DLGFB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QUFTO3NCQUFqQixLQUFLO2dCQUNHLFNBQVM7c0JBQWpCLEtBQUs7Z0JBQ0csU0FBUztzQkFBakIsS0FBSztnQkFFRyxZQUFZO3NCQUFwQixLQUFLO2dCQUNHLG9CQUFvQjtzQkFBNUIsS0FBSztnQkFDRyxtQkFBbUI7c0JBQTNCLEtBQUs7Z0JBRUcsUUFBUTtzQkFBaEIsS0FBSztnQkFDRyxHQUFHO3NCQUFYLEtBQUs7Z0JBRUksYUFBYTtzQkFBdEIsTUFBTTtnQkFDRyxXQUFXO3NCQUFwQixNQUFNO2dCQUNHLFFBQVE7c0JBQWpCLE1BQU07Z0JBQ0csWUFBWTtzQkFBckIsTUFBTTtnQkFDRyxRQUFRO3NCQUFqQixNQUFNO2dCQUNHLGVBQWU7c0JBQXhCLE1BQU07Z0JBQ0csWUFBWTtzQkFBckIsTUFBTTtnQkFDRyxnQkFBZ0I7c0JBQXpCLE1BQU07Z0JBR0csV0FBVztzQkFBcEIsTUFBTTtnQkFHa0MsVUFBVTtzQkFBbEQsU0FBUzt1QkFBQyxTQUFTLEVBQUUsRUFBRSxNQUFNLEVBQUUsS0FBSyxFQUFFIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtcbiAgQWZ0ZXJDb250ZW50SW5pdCxcbiAgQ2hhbmdlRGV0ZWN0aW9uU3RyYXRlZ3ksXG4gIENoYW5nZURldGVjdG9yUmVmLFxuICBDb21wb25lbnQsXG4gIEVsZW1lbnRSZWYsXG4gIEV2ZW50RW1pdHRlcixcbiAgSW5qZWN0LFxuICBJbnB1dCxcbiAgT25DaGFuZ2VzLFxuICBPbkRlc3Ryb3ksXG4gIE9uSW5pdCxcbiAgT3B0aW9uYWwsXG4gIE91dHB1dCxcbiAgUExBVEZPUk1fSUQsXG4gIFNpbXBsZUNoYW5nZXMsXG4gIFZpZXdDaGlsZCxcbn0gZnJvbSBcIkBhbmd1bGFyL2NvcmVcIjtcbmltcG9ydCB7IGlzUGxhdGZvcm1Ccm93c2VyLCBDb21tb25Nb2R1bGUgfSBmcm9tIFwiQGFuZ3VsYXIvY29tbW9uXCI7XG5cbmltcG9ydCB7IFNpZGViYXJDb250YWluZXIgfSBmcm9tIFwiLi9zaWRlYmFyLWNvbnRhaW5lci5jb21wb25lbnRcIjtcbmltcG9ydCB7IGlzTFRSLCBpc0lPUyB9IGZyb20gXCIuL3V0aWxzXCI7XG5cbkBDb21wb25lbnQoe1xuICBzZWxlY3RvcjogXCJuZy1zaWRlYmFyXCIsXG4gIHRlbXBsYXRlOiBgXG4gICAgPGFzaWRlXG4gICAgICAjc2lkZWJhclxuICAgICAgcm9sZT1cImNvbXBsZW1lbnRhcnlcIlxuICAgICAgW2F0dHIuYXJpYS1oaWRkZW5dPVwiIW9wZW5lZFwiXG4gICAgICBbYXR0ci5hcmlhLWxhYmVsXT1cImFyaWFMYWJlbFwiXG4gICAgICBjbGFzcz1cIm5nLXNpZGViYXIgbmctc2lkZWJhci0te3tcbiAgICAgICAgb3BlbmVkID8gJ29wZW5lZCcgOiAnY2xvc2VkJ1xuICAgICAgfX0gbmctc2lkZWJhci0te3sgcG9zaXRpb24gfX0gbmctc2lkZWJhci0te3sgbW9kZSB9fVwiXG4gICAgICBbY2xhc3Mubmctc2lkZWJhci0tZG9ja2VkXT1cIl9pc0RvY2tlZFwiXG4gICAgICBbY2xhc3Mubmctc2lkZWJhci0taW5lcnRdPVwiX2lzSW5lcnRcIlxuICAgICAgW2NsYXNzLm5nLXNpZGViYXItLWFuaW1hdGVdPVwiYW5pbWF0ZVwiXG4gICAgICBbbmdDbGFzc109XCJzaWRlYmFyQ2xhc3NcIlxuICAgICAgW25nU3R5bGVdPVwiX2dldFN0eWxlKClcIlxuICAgID5cbiAgICAgIDxuZy1jb250ZW50PjwvbmctY29udGVudD5cbiAgICA8L2FzaWRlPlxuICBgLFxuICBzdHlsZXM6IFtcbiAgICBgXG4gICAgICAubmctc2lkZWJhciB7XG4gICAgICAgIC13ZWJraXQtb3ZlcmZsb3ctc2Nyb2xsaW5nOiB0b3VjaDtcbiAgICAgICAgb3ZlcmZsb3c6IGF1dG87XG4gICAgICAgIHBvaW50ZXItZXZlbnRzOiBhdXRvO1xuICAgICAgICBwb3NpdGlvbjogYWJzb2x1dGU7XG4gICAgICAgIHRvdWNoLWFjdGlvbjogYXV0bztcbiAgICAgICAgd2lsbC1jaGFuZ2U6IGluaXRpYWw7XG4gICAgICAgIHotaW5kZXg6IDI7XG4gICAgICB9XG5cbiAgICAgIC5uZy1zaWRlYmFyLS1sZWZ0IHtcbiAgICAgICAgYm90dG9tOiAwO1xuICAgICAgICBsZWZ0OiAwO1xuICAgICAgICB0b3A6IDA7XG4gICAgICB9XG5cbiAgICAgIC5uZy1zaWRlYmFyLS1yaWdodCB7XG4gICAgICAgIGJvdHRvbTogMDtcbiAgICAgICAgcmlnaHQ6IDA7XG4gICAgICAgIHRvcDogMDtcbiAgICAgIH1cblxuICAgICAgLm5nLXNpZGViYXItLXRvcCB7XG4gICAgICAgIGxlZnQ6IDA7XG4gICAgICAgIHJpZ2h0OiAwO1xuICAgICAgICB0b3A6IDA7XG4gICAgICB9XG5cbiAgICAgIC5uZy1zaWRlYmFyLS1ib3R0b20ge1xuICAgICAgICBib3R0b206IDA7XG4gICAgICAgIGxlZnQ6IDA7XG4gICAgICAgIHJpZ2h0OiAwO1xuICAgICAgfVxuXG4gICAgICAubmctc2lkZWJhci0taW5lcnQge1xuICAgICAgICBwb2ludGVyLWV2ZW50czogbm9uZTtcbiAgICAgICAgdG91Y2gtYWN0aW9uOiBub25lO1xuICAgICAgICB3aWxsLWNoYW5nZTogdHJhbnNmb3JtO1xuICAgICAgfVxuXG4gICAgICAubmctc2lkZWJhci0tYW5pbWF0ZSB7XG4gICAgICAgIC13ZWJraXQtdHJhbnNpdGlvbjogLXdlYmtpdC10cmFuc2Zvcm0gMC4zcyBjdWJpYy1iZXppZXIoMCwgMCwgMC4zLCAxKTtcbiAgICAgICAgdHJhbnNpdGlvbjogdHJhbnNmb3JtIDAuM3MgY3ViaWMtYmV6aWVyKDAsIDAsIDAuMywgMSk7XG4gICAgICB9XG4gICAgYCxcbiAgXSxcbiAgY2hhbmdlRGV0ZWN0aW9uOiBDaGFuZ2VEZXRlY3Rpb25TdHJhdGVneS5PblB1c2gsXG4gIHN0YW5kYWxvbmU6IHRydWUsXG4gIGltcG9ydHM6IFtDb21tb25Nb2R1bGVdLFxufSlcbmV4cG9ydCBjbGFzcyBTaWRlYmFyIGltcGxlbWVudHMgQWZ0ZXJDb250ZW50SW5pdCwgT25Jbml0LCBPbkNoYW5nZXMsIE9uRGVzdHJveSB7XG4gIC8vIGBvcGVuZWRDaGFuZ2VgIGFsbG93cyBmb3IgXCIyLXdheVwiIGRhdGEgYmluZGluZ1xuICBASW5wdXQoKSBvcGVuZWQ6IGJvb2xlYW4gPSBmYWxzZTtcbiAgQE91dHB1dCgpIG9wZW5lZENoYW5nZTogRXZlbnRFbWl0dGVyPGJvb2xlYW4+ID0gbmV3IEV2ZW50RW1pdHRlcjxib29sZWFuPigpO1xuXG4gIEBJbnB1dCgpIG1vZGU6IFwib3ZlclwiIHwgXCJwdXNoXCIgfCBcInNsaWRlXCIgPSBcIm92ZXJcIjtcbiAgQElucHV0KCkgZG9jazogYm9vbGVhbiA9IGZhbHNlO1xuICBASW5wdXQoKSBkb2NrZWRTaXplOiBzdHJpbmcgPSBcIjBweFwiO1xuICBASW5wdXQoKSBwb3NpdGlvbjogXCJzdGFydFwiIHwgXCJlbmRcIiB8IFwibGVmdFwiIHwgXCJyaWdodFwiIHwgXCJ0b3BcIiB8IFwiYm90dG9tXCIgPVxuICAgIFwic3RhcnRcIjtcbiAgQElucHV0KCkgYW5pbWF0ZTogYm9vbGVhbiA9IHRydWU7XG5cbiAgQElucHV0KCkgYXV0b0NvbGxhcHNlSGVpZ2h0PzogbnVtYmVyO1xuICBASW5wdXQoKSBhdXRvQ29sbGFwc2VXaWR0aD86IG51bWJlcjtcbiAgQElucHV0KCkgYXV0b0NvbGxhcHNlT25Jbml0OiBib29sZWFuID0gdHJ1ZTtcblxuICBASW5wdXQoKSBzaWRlYmFyQ2xhc3M/OiBzdHJpbmc7XG5cbiAgQElucHV0KCkgYXJpYUxhYmVsPzogc3RyaW5nO1xuICBASW5wdXQoKSB0cmFwRm9jdXM6IGJvb2xlYW4gPSBmYWxzZTtcbiAgQElucHV0KCkgYXV0b0ZvY3VzOiBib29sZWFuID0gdHJ1ZTtcblxuICBASW5wdXQoKSBzaG93QmFja2Ryb3A6IGJvb2xlYW4gPSBmYWxzZTtcbiAgQElucHV0KCkgY2xvc2VPbkNsaWNrQmFja2Ryb3A6IGJvb2xlYW4gPSBmYWxzZTtcbiAgQElucHV0KCkgY2xvc2VPbkNsaWNrT3V0c2lkZTogYm9vbGVhbiA9IGZhbHNlO1xuXG4gIEBJbnB1dCgpIGtleUNsb3NlOiBib29sZWFuID0gZmFsc2U7XG4gIEBJbnB1dCgpIGtleTogc3RyaW5nID0gXCJFc2NhcGVcIjsgLy8gRGVmYXVsdCB0byBFc2NhcGUga2V5XG5cbiAgQE91dHB1dCgpIG9uQ29udGVudEluaXQ6IEV2ZW50RW1pdHRlcjxudWxsPiA9IG5ldyBFdmVudEVtaXR0ZXI8bnVsbD4oKTtcbiAgQE91dHB1dCgpIG9uT3BlblN0YXJ0OiBFdmVudEVtaXR0ZXI8bnVsbD4gPSBuZXcgRXZlbnRFbWl0dGVyPG51bGw+KCk7XG4gIEBPdXRwdXQoKSBvbk9wZW5lZDogRXZlbnRFbWl0dGVyPG51bGw+ID0gbmV3IEV2ZW50RW1pdHRlcjxudWxsPigpO1xuICBAT3V0cHV0KCkgb25DbG9zZVN0YXJ0OiBFdmVudEVtaXR0ZXI8bnVsbD4gPSBuZXcgRXZlbnRFbWl0dGVyPG51bGw+KCk7XG4gIEBPdXRwdXQoKSBvbkNsb3NlZDogRXZlbnRFbWl0dGVyPG51bGw+ID0gbmV3IEV2ZW50RW1pdHRlcjxudWxsPigpO1xuICBAT3V0cHV0KCkgb25UcmFuc2l0aW9uRW5kOiBFdmVudEVtaXR0ZXI8bnVsbD4gPSBuZXcgRXZlbnRFbWl0dGVyPG51bGw+KCk7XG4gIEBPdXRwdXQoKSBvbk1vZGVDaGFuZ2U6IEV2ZW50RW1pdHRlcjxzdHJpbmc+ID0gbmV3IEV2ZW50RW1pdHRlcjxzdHJpbmc+KCk7XG4gIEBPdXRwdXQoKSBvblBvc2l0aW9uQ2hhbmdlOiBFdmVudEVtaXR0ZXI8c3RyaW5nPiA9IG5ldyBFdmVudEVtaXR0ZXI8c3RyaW5nPigpO1xuXG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgQE91dHB1dCgpIF9vblJlcmVuZGVyOiBFdmVudEVtaXR0ZXI8bnVsbD4gPSBuZXcgRXZlbnRFbWl0dGVyPG51bGw+KCk7XG5cbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBAVmlld0NoaWxkKFwic2lkZWJhclwiLCB7IHN0YXRpYzogZmFsc2UgfSkgX2VsU2lkZWJhciE6IEVsZW1lbnRSZWY7XG5cbiAgcHJpdmF0ZSBfZm9jdXNhYmxlRWxlbWVudHNTdHJpbmc6IHN0cmluZyA9XG4gICAgXCJhW2hyZWZdLCBhcmVhW2hyZWZdLCBpbnB1dDpub3QoW2Rpc2FibGVkXSksIHNlbGVjdDpub3QoW2Rpc2FibGVkXSksXCIgK1xuICAgIFwidGV4dGFyZWE6bm90KFtkaXNhYmxlZF0pLCBidXR0b246bm90KFtkaXNhYmxlZF0pLCBpZnJhbWUsIG9iamVjdCwgZW1iZWQsIFt0YWJpbmRleF0sIFtjb250ZW50ZWRpdGFibGVdXCI7XG4gIHByaXZhdGUgX2ZvY3VzYWJsZUVsZW1lbnRzPzogQXJyYXk8SFRNTEVsZW1lbnQ+O1xuICBwcml2YXRlIF9mb2N1c2VkQmVmb3JlT3BlbjogSFRNTEVsZW1lbnQgfCBudWxsID0gbnVsbDtcblxuICBwcml2YXRlIF90YWJJbmRleEF0dHI6IHN0cmluZyA9IFwiX190YWJpbmRleF9fXCI7XG4gIHByaXZhdGUgX3RhYkluZGV4SW5kaWNhdG9yQXR0cjogc3RyaW5nID0gXCJfX25nc2lkZWJhci10YWJpbmRleF9fXCI7XG5cbiAgcHJpdmF0ZSBfd2FzQ29sbGFwc2VkOiBib29sZWFuID0gZmFsc2U7XG5cbiAgLy8gRGVsYXkgaW5pdGlhbCBhbmltYXRpb24gKGlzc3VlcyAjNTksICMxMTIpXG4gIHByaXZhdGUgX3Nob3VsZEFuaW1hdGU6IGJvb2xlYW4gPSBmYWxzZTtcblxuICBwcml2YXRlIF9jbGlja0V2ZW50OiBzdHJpbmcgPSBcImNsaWNrXCI7XG4gIHByaXZhdGUgX29uQ2xpY2tPdXRzaWRlQXR0YWNoZWQ6IGJvb2xlYW4gPSBmYWxzZTtcbiAgcHJpdmF0ZSBfb25LZXlEb3duQXR0YWNoZWQ6IGJvb2xlYW4gPSBmYWxzZTtcbiAgcHJpdmF0ZSBfb25SZXNpemVBdHRhY2hlZDogYm9vbGVhbiA9IGZhbHNlO1xuXG4gIHByaXZhdGUgX2lzQnJvd3NlcjogYm9vbGVhbjtcblxuICBjb25zdHJ1Y3RvcihcbiAgICBAT3B0aW9uYWwoKSBwcml2YXRlIF9jb250YWluZXI6IFNpZGViYXJDb250YWluZXIsXG4gICAgcHJpdmF0ZSBfcmVmOiBDaGFuZ2VEZXRlY3RvclJlZixcbiAgICBASW5qZWN0KFBMQVRGT1JNX0lEKSBwbGF0Zm9ybUlkOiBPYmplY3RcbiAgKSB7XG4gICAgaWYgKCF0aGlzLl9jb250YWluZXIpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgXCI8bmctc2lkZWJhcj4gbXVzdCBiZSBpbnNpZGUgYSA8bmctc2lkZWJhci1jb250YWluZXI+LiBcIiArXG4gICAgICAgICAgXCJTZWUgaHR0cHM6Ly9naXRodWIuY29tL2Fya29uL25nLXNpZGViYXIjdXNhZ2UgZm9yIG1vcmUgaW5mby5cIlxuICAgICAgKTtcbiAgICB9XG5cbiAgICB0aGlzLl9pc0Jyb3dzZXIgPSBpc1BsYXRmb3JtQnJvd3NlcihwbGF0Zm9ybUlkKTtcblxuICAgIC8vIEhhbmRsZSB0YXBzIGluIGlPU1xuICAgIGlmICh0aGlzLl9pc0Jyb3dzZXIgJiYgaXNJT1MoKSAmJiAhKFwib25jbGlja1wiIGluIHdpbmRvdykpIHtcbiAgICAgIHRoaXMuX2NsaWNrRXZlbnQgPSBcInRvdWNoc3RhcnRcIjtcbiAgICB9XG5cbiAgICB0aGlzLl9ub3JtYWxpemVQb3NpdGlvbigpO1xuXG4gICAgdGhpcy5vcGVuID0gdGhpcy5vcGVuLmJpbmQodGhpcyk7XG4gICAgdGhpcy5jbG9zZSA9IHRoaXMuY2xvc2UuYmluZCh0aGlzKTtcbiAgICB0aGlzLl9vblRyYW5zaXRpb25FbmQgPSB0aGlzLl9vblRyYW5zaXRpb25FbmQuYmluZCh0aGlzKTtcbiAgICB0aGlzLl9vbkZvY3VzVHJhcCA9IHRoaXMuX29uRm9jdXNUcmFwLmJpbmQodGhpcyk7XG4gICAgdGhpcy5fb25DbGlja091dHNpZGUgPSB0aGlzLl9vbkNsaWNrT3V0c2lkZS5iaW5kKHRoaXMpO1xuICAgIHRoaXMuX29uS2V5RG93biA9IHRoaXMuX29uS2V5RG93bi5iaW5kKHRoaXMpO1xuICAgIHRoaXMuX2NvbGxhcHNlID0gdGhpcy5fY29sbGFwc2UuYmluZCh0aGlzKTtcbiAgfVxuXG4gIG5nT25Jbml0KCk6IHZvaWQge1xuICAgIGlmICghdGhpcy5faXNCcm93c2VyKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgaWYgKHRoaXMuYW5pbWF0ZSkge1xuICAgICAgdGhpcy5fc2hvdWxkQW5pbWF0ZSA9IHRydWU7XG4gICAgICB0aGlzLmFuaW1hdGUgPSBmYWxzZTtcbiAgICB9XG5cbiAgICB0aGlzLl9jb250YWluZXIuX2FkZFNpZGViYXIodGhpcyk7XG5cbiAgICBpZiAodGhpcy5hdXRvQ29sbGFwc2VPbkluaXQpIHtcbiAgICAgIHRoaXMuX2NvbGxhcHNlKCk7XG4gICAgfVxuICB9XG5cbiAgbmdBZnRlckNvbnRlbnRJbml0KCk6IHZvaWQge1xuICAgIHRoaXMub25Db250ZW50SW5pdC5lbWl0KCk7XG4gIH1cblxuICBuZ09uQ2hhbmdlcyhjaGFuZ2VzOiBTaW1wbGVDaGFuZ2VzKTogdm9pZCB7XG4gICAgaWYgKCF0aGlzLl9pc0Jyb3dzZXIpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBpZiAoY2hhbmdlc1tcImFuaW1hdGVcIl0gJiYgdGhpcy5fc2hvdWxkQW5pbWF0ZSkge1xuICAgICAgdGhpcy5fc2hvdWxkQW5pbWF0ZSA9IGNoYW5nZXNbXCJhbmltYXRlXCJdLmN1cnJlbnRWYWx1ZTtcbiAgICB9XG5cbiAgICBpZiAoY2hhbmdlc1tcImNsb3NlT25DbGlja091dHNpZGVcIl0pIHtcbiAgICAgIGlmIChjaGFuZ2VzW1wiY2xvc2VPbkNsaWNrT3V0c2lkZVwiXS5jdXJyZW50VmFsdWUpIHtcbiAgICAgICAgdGhpcy5faW5pdENsb3NlQ2xpY2tMaXN0ZW5lcigpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5fZGVzdHJveUNsb3NlQ2xpY2tMaXN0ZW5lcigpO1xuICAgICAgfVxuICAgIH1cbiAgICBpZiAoY2hhbmdlc1tcImtleUNsb3NlXCJdKSB7XG4gICAgICBpZiAoY2hhbmdlc1tcImtleUNsb3NlXCJdLmN1cnJlbnRWYWx1ZSkge1xuICAgICAgICB0aGlzLl9pbml0Q2xvc2VLZXlEb3duTGlzdGVuZXIoKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMuX2Rlc3Ryb3lDbG9zZUtleURvd25MaXN0ZW5lcigpO1xuICAgICAgfVxuICAgIH1cblxuICAgIGlmIChjaGFuZ2VzW1wicG9zaXRpb25cIl0pIHtcbiAgICAgIC8vIEhhbmRsZSBcInN0YXJ0XCIgYW5kIFwiZW5kXCIgYWxpYXNlc1xuICAgICAgdGhpcy5fbm9ybWFsaXplUG9zaXRpb24oKTtcblxuICAgICAgLy8gRW1pdCBjaGFuZ2UgaW4gdGltZW91dCB0byBhbGxvdyBmb3IgcG9zaXRpb24gY2hhbmdlIHRvIGJlIHJlbmRlcmVkIGZpcnN0XG4gICAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgdGhpcy5vblBvc2l0aW9uQ2hhbmdlLmVtaXQoY2hhbmdlc1tcInBvc2l0aW9uXCJdLmN1cnJlbnRWYWx1ZSk7XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICBpZiAoY2hhbmdlc1tcIm1vZGVcIl0pIHtcbiAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICB0aGlzLm9uTW9kZUNoYW5nZS5lbWl0KGNoYW5nZXNbXCJtb2RlXCJdLmN1cnJlbnRWYWx1ZSk7XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICBpZiAoY2hhbmdlc1tcImRvY2tcIl0pIHtcbiAgICAgIHRoaXMudHJpZ2dlclJlcmVuZGVyKCk7XG4gICAgfVxuXG4gICAgaWYgKGNoYW5nZXNbXCJvcGVuZWRcIl0pIHtcbiAgICAgIGlmICh0aGlzLl9zaG91bGRBbmltYXRlKSB7XG4gICAgICAgIHRoaXMuYW5pbWF0ZSA9IHRydWU7XG4gICAgICAgIHRoaXMuX3Nob3VsZEFuaW1hdGUgPSBmYWxzZTtcbiAgICAgIH1cblxuICAgICAgaWYgKGNoYW5nZXNbXCJvcGVuZWRcIl0uY3VycmVudFZhbHVlKSB7XG4gICAgICAgIHRoaXMub3BlbigpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5jbG9zZSgpO1xuICAgICAgfVxuICAgIH1cblxuICAgIGlmIChjaGFuZ2VzW1wiYXV0b0NvbGxhcHNlSGVpZ2h0XCJdIHx8IGNoYW5nZXNbXCJhdXRvQ29sbGFwc2VXaWR0aFwiXSkge1xuICAgICAgdGhpcy5faW5pdENvbGxhcHNlTGlzdGVuZXJzKCk7XG4gICAgfVxuICB9XG5cbiAgbmdPbkRlc3Ryb3koKTogdm9pZCB7XG4gICAgaWYgKCF0aGlzLl9pc0Jyb3dzZXIpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB0aGlzLl9kZXN0cm95Q2xvc2VMaXN0ZW5lcnMoKTtcbiAgICB0aGlzLl9kZXN0cm95Q29sbGFwc2VMaXN0ZW5lcnMoKTtcblxuICAgIHRoaXMuX2NvbnRhaW5lci5fcmVtb3ZlU2lkZWJhcih0aGlzKTtcbiAgfVxuXG4gIC8vIFNpZGViYXIgdG9nZ2xpbmdcbiAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuXG4gIC8qKlxuICAgKiBPcGVucyB0aGUgc2lkZWJhciBhbmQgZW1pdHMgdGhlIGFwcHJvcHJpYXRlIGV2ZW50cy5cbiAgICovXG4gIG9wZW4oKTogdm9pZCB7XG4gICAgaWYgKCF0aGlzLl9pc0Jyb3dzZXIpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB0aGlzLm9wZW5lZCA9IHRydWU7XG4gICAgdGhpcy5vcGVuZWRDaGFuZ2UuZW1pdCh0cnVlKTtcblxuICAgIHRoaXMub25PcGVuU3RhcnQuZW1pdCgpO1xuXG4gICAgdGhpcy5fcmVmLmRldGVjdENoYW5nZXMoKTtcblxuICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgaWYgKHRoaXMuYW5pbWF0ZSAmJiAhdGhpcy5faXNNb2RlU2xpZGUpIHtcbiAgICAgICAgdGhpcy5fZWxTaWRlYmFyLm5hdGl2ZUVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcbiAgICAgICAgICBcInRyYW5zaXRpb25lbmRcIixcbiAgICAgICAgICB0aGlzLl9vblRyYW5zaXRpb25FbmRcbiAgICAgICAgKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMuX3NldEZvY3VzZWQoKTtcbiAgICAgICAgdGhpcy5faW5pdENsb3NlTGlzdGVuZXJzKCk7XG5cbiAgICAgICAgaWYgKHRoaXMub3BlbmVkKSB7XG4gICAgICAgICAgdGhpcy5vbk9wZW5lZC5lbWl0KCk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDbG9zZXMgdGhlIHNpZGViYXIgYW5kIGVtaXRzIHRoZSBhcHByb3ByaWF0ZSBldmVudHMuXG4gICAqL1xuICBjbG9zZSgpOiB2b2lkIHtcbiAgICBpZiAoIXRoaXMuX2lzQnJvd3Nlcikge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHRoaXMub3BlbmVkID0gZmFsc2U7XG4gICAgdGhpcy5vcGVuZWRDaGFuZ2UuZW1pdChmYWxzZSk7XG5cbiAgICB0aGlzLm9uQ2xvc2VTdGFydC5lbWl0KCk7XG5cbiAgICB0aGlzLl9yZWYuZGV0ZWN0Q2hhbmdlcygpO1xuXG4gICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICBpZiAodGhpcy5hbmltYXRlICYmICF0aGlzLl9pc01vZGVTbGlkZSkge1xuICAgICAgICB0aGlzLl9lbFNpZGViYXIubmF0aXZlRWxlbWVudC5hZGRFdmVudExpc3RlbmVyKFxuICAgICAgICAgIFwidHJhbnNpdGlvbmVuZFwiLFxuICAgICAgICAgIHRoaXMuX29uVHJhbnNpdGlvbkVuZFxuICAgICAgICApO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5fc2V0Rm9jdXNlZCgpO1xuICAgICAgICB0aGlzLl9kZXN0cm95Q2xvc2VMaXN0ZW5lcnMoKTtcblxuICAgICAgICBpZiAoIXRoaXMub3BlbmVkKSB7XG4gICAgICAgICAgdGhpcy5vbkNsb3NlZC5lbWl0KCk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBNYW51YWxseSB0cmlnZ2VyIGEgcmUtcmVuZGVyIG9mIHRoZSBjb250YWluZXIuIFVzZWZ1bCBpZiB0aGUgc2lkZWJhciBjb250ZW50cyBtaWdodCBjaGFuZ2UuXG4gICAqL1xuICB0cmlnZ2VyUmVyZW5kZXIoKTogdm9pZCB7XG4gICAgaWYgKCF0aGlzLl9pc0Jyb3dzZXIpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgIHRoaXMuX29uUmVyZW5kZXIuZW1pdCgpO1xuICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIEBpbnRlcm5hbFxuICAgKlxuICAgKiBDb21wdXRlcyB0aGUgdHJhbnNmb3JtIHN0eWxlcyBmb3IgdGhlIHNpZGViYXIgdGVtcGxhdGUuXG4gICAqXG4gICAqIEByZXR1cm4ge0NTU1N0eWxlRGVjbGFyYXRpb259IFRoZSB0cmFuc2Zvcm0gc3R5bGVzLCB3aXRoIHRoZSBXZWJLaXQtcHJlZml4ZWQgdmVyc2lvbiBhcyB3ZWxsLlxuICAgKi9cbiAgX2dldFN0eWxlKCk6IENTU1N0eWxlRGVjbGFyYXRpb24ge1xuICAgIGxldCB0cmFuc2Zvcm1TdHlsZTogc3RyaW5nID0gXCJcIjtcblxuICAgIC8vIEhpZGVzIHNpZGViYXIgb2ZmIHNjcmVlbiB3aGVuIGNsb3NlZFxuICAgIGlmICghdGhpcy5vcGVuZWQpIHtcbiAgICAgIGNvbnN0IHRyYW5zZm9ybURpcjogc3RyaW5nID1cbiAgICAgICAgXCJ0cmFuc2xhdGVcIiArICh0aGlzLl9pc0xlZnRPclJpZ2h0ID8gXCJYXCIgOiBcIllcIik7XG4gICAgICBsZXQgdHJhbnNsYXRlQW10OiBzdHJpbmcgPSBgJHt0aGlzLl9pc0xlZnRPclRvcCA/IFwiLVwiIDogXCJcIn0xMDAlYDtcblxuICAgICAgdHJhbnNmb3JtU3R5bGUgPSBgJHt0cmFuc2Zvcm1EaXJ9KCR7dHJhbnNsYXRlQW10fSlgO1xuXG4gICAgICAvLyBEb2NrZWQgbW9kZTogcGFydGlhbGx5IHJlbWFpbnMgb3BlblxuICAgICAgLy8gTm90ZSB0aGF0IHVzaW5nIGBjYWxjKC4uLilgIHdpdGhpbiBgdHJhbnNmb3JtKC4uLilgIGRvZXNuJ3Qgd29yayBpbiBJRVxuICAgICAgaWYgKFxuICAgICAgICB0aGlzLmRvY2sgJiZcbiAgICAgICAgdGhpcy5fZG9ja2VkU2l6ZSA+IDAgJiZcbiAgICAgICAgISh0aGlzLl9pc01vZGVTbGlkZSAmJiB0aGlzLm9wZW5lZClcbiAgICAgICkge1xuICAgICAgICB0cmFuc2Zvcm1TdHlsZSArPSBgICR7dHJhbnNmb3JtRGlyfSgke3RoaXMuX2lzTGVmdE9yVG9wID8gXCIrXCIgOiBcIi1cIn0ke1xuICAgICAgICAgIHRoaXMuZG9ja2VkU2l6ZVxuICAgICAgICB9KWA7XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIHtcbiAgICAgIHdlYmtpdFRyYW5zZm9ybTogdHJhbnNmb3JtU3R5bGUsXG4gICAgICB0cmFuc2Zvcm06IHRyYW5zZm9ybVN0eWxlLFxuICAgIH0gYXMgQ1NTU3R5bGVEZWNsYXJhdGlvbjtcbiAgfVxuXG4gIC8qKlxuICAgKiBAaW50ZXJuYWxcbiAgICpcbiAgICogSGFuZGxlcyB0aGUgYHRyYW5zaXRpb25lbmRgIGV2ZW50IG9uIHRoZSBzaWRlYmFyIHRvIGVtaXQgdGhlIG9uT3BlbmVkL29uQ2xvc2VkIGV2ZW50cyBhZnRlciB0aGUgdHJhbnNmb3JtXG4gICAqIHRyYW5zaXRpb24gaXMgY29tcGxldGVkLlxuICAgKi9cbiAgX29uVHJhbnNpdGlvbkVuZChlOiBUcmFuc2l0aW9uRXZlbnQpOiB2b2lkIHtcbiAgICBpZiAoXG4gICAgICBlLnRhcmdldCA9PT0gdGhpcy5fZWxTaWRlYmFyLm5hdGl2ZUVsZW1lbnQgJiZcbiAgICAgIGUucHJvcGVydHlOYW1lLmVuZHNXaXRoKFwidHJhbnNmb3JtXCIpXG4gICAgKSB7XG4gICAgICB0aGlzLl9zZXRGb2N1c2VkKCk7XG5cbiAgICAgIGlmICh0aGlzLm9wZW5lZCkge1xuICAgICAgICB0aGlzLl9pbml0Q2xvc2VMaXN0ZW5lcnMoKTtcbiAgICAgICAgdGhpcy5vbk9wZW5lZC5lbWl0KCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLl9kZXN0cm95Q2xvc2VMaXN0ZW5lcnMoKTtcbiAgICAgICAgdGhpcy5vbkNsb3NlZC5lbWl0KCk7XG4gICAgICB9XG5cbiAgICAgIHRoaXMub25UcmFuc2l0aW9uRW5kLmVtaXQoKTtcblxuICAgICAgdGhpcy5fZWxTaWRlYmFyLm5hdGl2ZUVsZW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcihcbiAgICAgICAgXCJ0cmFuc2l0aW9uZW5kXCIsXG4gICAgICAgIHRoaXMuX29uVHJhbnNpdGlvbkVuZFxuICAgICAgKTtcbiAgICB9XG4gIH1cblxuICAvLyBGb2N1cyBvbiBvcGVuL2Nsb3NlXG4gIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cblxuICAvKipcbiAgICogUmV0dXJucyB3aGV0aGVyIGZvY3VzIHNob3VsZCBiZSB0cmFwcGVkIHdpdGhpbiB0aGUgc2lkZWJhci5cbiAgICpcbiAgICogQHJldHVybiB7Ym9vbGVhbn0gVHJhcCBmb2N1cyBpbnNpZGUgc2lkZWJhci5cbiAgICovXG4gIHByaXZhdGUgZ2V0IF9zaG91bGRUcmFwRm9jdXMoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMub3BlbmVkICYmIHRoaXMudHJhcEZvY3VzO1xuICB9XG5cbiAgLyoqXG4gICAqIFNldHMgZm9jdXMgdG8gdGhlIGZpcnN0IGZvY3VzYWJsZSBlbGVtZW50IGluc2lkZSB0aGUgc2lkZWJhci5cbiAgICovXG4gIHByaXZhdGUgX2ZvY3VzRmlyc3RJdGVtKCk6IHZvaWQge1xuICAgIGlmICh0aGlzLl9mb2N1c2FibGVFbGVtZW50cyAmJiB0aGlzLl9mb2N1c2FibGVFbGVtZW50cy5sZW5ndGggPiAwKSB7XG4gICAgICB0aGlzLl9mb2N1c2FibGVFbGVtZW50c1swXS5mb2N1cygpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBMb29wcyBmb2N1cyBiYWNrIHRvIHRoZSBzdGFydCBvZiB0aGUgc2lkZWJhciBpZiBzZXQgdG8gZG8gc28uXG4gICAqL1xuICBwcml2YXRlIF9vbkZvY3VzVHJhcChlOiBGb2N1c0V2ZW50KTogdm9pZCB7XG4gICAgaWYgKFxuICAgICAgdGhpcy5fc2hvdWxkVHJhcEZvY3VzICYmXG4gICAgICAhdGhpcy5fZWxTaWRlYmFyLm5hdGl2ZUVsZW1lbnQuY29udGFpbnMoZS50YXJnZXQgYXMgTm9kZSlcbiAgICApIHtcbiAgICAgIHRoaXMuX2ZvY3VzRmlyc3RJdGVtKCk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIEhhbmRsZXMgdGhlIGFiaWxpdHkgdG8gZm9jdXMgc2lkZWJhciBlbGVtZW50cyB3aGVuIGl0J3Mgb3Blbi9jbG9zZWQgdG8gZW5zdXJlIHRoYXQgdGhlIHNpZGViYXIgaXMgaW5lcnQgd2hlblxuICAgKiBhcHByb3ByaWF0ZS5cbiAgICovXG4gIHByaXZhdGUgX3NldEZvY3VzZWQoKTogdm9pZCB7XG4gICAgdGhpcy5fZm9jdXNhYmxlRWxlbWVudHMgPSBBcnJheS5mcm9tKFxuICAgICAgdGhpcy5fZWxTaWRlYmFyLm5hdGl2ZUVsZW1lbnQucXVlcnlTZWxlY3RvckFsbChcbiAgICAgICAgdGhpcy5fZm9jdXNhYmxlRWxlbWVudHNTdHJpbmdcbiAgICAgIClcbiAgICApIGFzIEFycmF5PEhUTUxFbGVtZW50PjtcblxuICAgIGlmICh0aGlzLm9wZW5lZCkge1xuICAgICAgdGhpcy5fZm9jdXNlZEJlZm9yZU9wZW4gPSBkb2N1bWVudC5hY3RpdmVFbGVtZW50IGFzIEhUTUxFbGVtZW50O1xuXG4gICAgICAvLyBSZXN0b3JlIGZvY3VzYWJpbGl0eSwgd2l0aCBwcmV2aW91cyB0YWJpbmRleCBhdHRyaWJ1dGVzXG4gICAgICBmb3IgKGNvbnN0IGVsIG9mIHRoaXMuX2ZvY3VzYWJsZUVsZW1lbnRzKSB7XG4gICAgICAgIGNvbnN0IHByZXZUYWJJbmRleCA9IGVsLmdldEF0dHJpYnV0ZSh0aGlzLl90YWJJbmRleEF0dHIpO1xuICAgICAgICBjb25zdCB3YXNUYWJJbmRleFNldCA9XG4gICAgICAgICAgZWwuZ2V0QXR0cmlidXRlKHRoaXMuX3RhYkluZGV4SW5kaWNhdG9yQXR0cikgIT09IG51bGw7XG4gICAgICAgIGlmIChwcmV2VGFiSW5kZXggIT09IG51bGwpIHtcbiAgICAgICAgICBlbC5zZXRBdHRyaWJ1dGUoXCJ0YWJpbmRleFwiLCBwcmV2VGFiSW5kZXgpO1xuICAgICAgICAgIGVsLnJlbW92ZUF0dHJpYnV0ZSh0aGlzLl90YWJJbmRleEF0dHIpO1xuICAgICAgICB9IGVsc2UgaWYgKHdhc1RhYkluZGV4U2V0KSB7XG4gICAgICAgICAgZWwucmVtb3ZlQXR0cmlidXRlKFwidGFiaW5kZXhcIik7XG4gICAgICAgICAgZWwucmVtb3ZlQXR0cmlidXRlKHRoaXMuX3RhYkluZGV4SW5kaWNhdG9yQXR0cik7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgaWYgKHRoaXMuYXV0b0ZvY3VzKSB7XG4gICAgICAgIHRoaXMuX2ZvY3VzRmlyc3RJdGVtKCk7XG4gICAgICB9XG5cbiAgICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJmb2N1c1wiLCB0aGlzLl9vbkZvY3VzVHJhcCwgdHJ1ZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIE1hbnVhbGx5IG1ha2UgYWxsIGZvY3VzYWJsZSBlbGVtZW50cyB1bmZvY3VzYWJsZSwgc2F2aW5nIGV4aXN0aW5nIHRhYmluZGV4IGF0dHJpYnV0ZXNcbiAgICAgIGZvciAoY29uc3QgZWwgb2YgdGhpcy5fZm9jdXNhYmxlRWxlbWVudHMpIHtcbiAgICAgICAgY29uc3QgZXhpc3RpbmdUYWJJbmRleCA9IGVsLmdldEF0dHJpYnV0ZShcInRhYmluZGV4XCIpO1xuICAgICAgICBlbC5zZXRBdHRyaWJ1dGUoXCJ0YWJpbmRleFwiLCBcIi0xXCIpO1xuICAgICAgICBlbC5zZXRBdHRyaWJ1dGUodGhpcy5fdGFiSW5kZXhJbmRpY2F0b3JBdHRyLCBcIlwiKTtcblxuICAgICAgICBpZiAoZXhpc3RpbmdUYWJJbmRleCAhPT0gbnVsbCkge1xuICAgICAgICAgIGVsLnNldEF0dHJpYnV0ZSh0aGlzLl90YWJJbmRleEF0dHIsIGV4aXN0aW5nVGFiSW5kZXgpO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGRvY3VtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJmb2N1c1wiLCB0aGlzLl9vbkZvY3VzVHJhcCwgdHJ1ZSk7XG5cbiAgICAgIC8vIFNldCBmb2N1cyBiYWNrIHRvIGVsZW1lbnQgYmVmb3JlIHRoZSBzaWRlYmFyIHdhcyBvcGVuZWRcbiAgICAgIGlmICh0aGlzLl9mb2N1c2VkQmVmb3JlT3BlbiAmJiB0aGlzLmF1dG9Gb2N1cyAmJiB0aGlzLl9pc01vZGVPdmVyKSB7XG4gICAgICAgIHRoaXMuX2ZvY3VzZWRCZWZvcmVPcGVuLmZvY3VzKCk7XG4gICAgICAgIHRoaXMuX2ZvY3VzZWRCZWZvcmVPcGVuID0gbnVsbDtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAvLyBDbG9zZSBldmVudCBoYW5kbGVyc1xuICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG5cbiAgLyoqXG4gICAqIEluaXRpYWxpemVzIGV2ZW50IGhhbmRsZXJzIGZvciB0aGUgY2xvc2VPbkNsaWNrT3V0c2lkZSBhbmQga2V5Q2xvc2Ugb3B0aW9ucy5cbiAgICovXG4gIHByaXZhdGUgX2luaXRDbG9zZUxpc3RlbmVycygpOiB2b2lkIHtcbiAgICB0aGlzLl9pbml0Q2xvc2VDbGlja0xpc3RlbmVyKCk7XG4gICAgdGhpcy5faW5pdENsb3NlS2V5RG93bkxpc3RlbmVyKCk7XG4gIH1cblxuICBwcml2YXRlIF9pbml0Q2xvc2VDbGlja0xpc3RlbmVyKCk6IHZvaWQge1xuICAgIC8vIEluIGEgdGltZW91dCBzbyB0aGF0IHRoaW5ncyByZW5kZXIgZmlyc3RcbiAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgIGlmIChcbiAgICAgICAgdGhpcy5vcGVuZWQgJiZcbiAgICAgICAgdGhpcy5jbG9zZU9uQ2xpY2tPdXRzaWRlICYmXG4gICAgICAgICF0aGlzLl9vbkNsaWNrT3V0c2lkZUF0dGFjaGVkXG4gICAgICApIHtcbiAgICAgICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcih0aGlzLl9jbGlja0V2ZW50LCB0aGlzLl9vbkNsaWNrT3V0c2lkZSk7XG4gICAgICAgIHRoaXMuX29uQ2xpY2tPdXRzaWRlQXR0YWNoZWQgPSB0cnVlO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgcHJpdmF0ZSBfaW5pdENsb3NlS2V5RG93bkxpc3RlbmVyKCk6IHZvaWQge1xuICAgIC8vIEluIGEgdGltZW91dCBzbyB0aGF0IHRoaW5ncyByZW5kZXIgZmlyc3RcbiAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgIGlmICh0aGlzLm9wZW5lZCAmJiB0aGlzLmtleUNsb3NlICYmICF0aGlzLl9vbktleURvd25BdHRhY2hlZCkge1xuICAgICAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKFwia2V5ZG93blwiLCB0aGlzLl9vbktleURvd24pO1xuICAgICAgICB0aGlzLl9vbktleURvd25BdHRhY2hlZCA9IHRydWU7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogRGVzdHJveXMgYWxsIGV2ZW50IGhhbmRsZXJzIGZyb20gX2luaXRDbG9zZUxpc3RlbmVycy5cbiAgICovXG4gIHByaXZhdGUgX2Rlc3Ryb3lDbG9zZUxpc3RlbmVycygpOiB2b2lkIHtcbiAgICB0aGlzLl9kZXN0cm95Q2xvc2VDbGlja0xpc3RlbmVyKCk7XG4gICAgdGhpcy5fZGVzdHJveUNsb3NlS2V5RG93bkxpc3RlbmVyKCk7XG4gIH1cblxuICBwcml2YXRlIF9kZXN0cm95Q2xvc2VDbGlja0xpc3RlbmVyKCk6IHZvaWQge1xuICAgIGlmICh0aGlzLl9vbkNsaWNrT3V0c2lkZUF0dGFjaGVkKSB7XG4gICAgICBkb2N1bWVudC5yZW1vdmVFdmVudExpc3RlbmVyKHRoaXMuX2NsaWNrRXZlbnQsIHRoaXMuX29uQ2xpY2tPdXRzaWRlKTtcbiAgICAgIHRoaXMuX29uQ2xpY2tPdXRzaWRlQXR0YWNoZWQgPSBmYWxzZTtcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIF9kZXN0cm95Q2xvc2VLZXlEb3duTGlzdGVuZXIoKTogdm9pZCB7XG4gICAgaWYgKHRoaXMuX29uS2V5RG93bkF0dGFjaGVkKSB7XG4gICAgICBkb2N1bWVudC5yZW1vdmVFdmVudExpc3RlbmVyKFwia2V5ZG93blwiLCB0aGlzLl9vbktleURvd24pO1xuICAgICAgdGhpcy5fb25LZXlEb3duQXR0YWNoZWQgPSBmYWxzZTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogSGFuZGxlcyBgY2xpY2tgIGV2ZW50cyBvbiBhbnl0aGluZyB3aGlsZSB0aGUgc2lkZWJhciBpcyBvcGVuIGZvciB0aGUgY2xvc2VPbkNsaWNrT3V0c2lkZSBvcHRpb24uXG4gICAqIFByb2dyYW1hdGljYWxseSBjbG9zZXMgdGhlIHNpZGViYXIgaWYgYSBjbGljayBvY2N1cnMgb3V0c2lkZSB0aGUgc2lkZWJhci5cbiAgICpcbiAgICogQHBhcmFtIGUge01vdXNlRXZlbnR9IE1vdXNlIGNsaWNrIGV2ZW50LlxuICAgKi9cbiAgcHJpdmF0ZSBfb25DbGlja091dHNpZGUoZTogTW91c2VFdmVudCB8IEV2ZW50KTogdm9pZCB7XG4gICAgaWYgKFxuICAgICAgdGhpcy5fb25DbGlja091dHNpZGVBdHRhY2hlZCAmJlxuICAgICAgdGhpcy5fZWxTaWRlYmFyICYmXG4gICAgICAhdGhpcy5fZWxTaWRlYmFyLm5hdGl2ZUVsZW1lbnQuY29udGFpbnMoZS50YXJnZXQgYXMgTm9kZSlcbiAgICApIHtcbiAgICAgIHRoaXMuY2xvc2UoKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogSGFuZGxlcyB0aGUgYGtleWRvd25gIGV2ZW50IGZvciB0aGUga2V5Q2xvc2Ugb3B0aW9uLlxuICAgKlxuICAgKiBAcGFyYW0gZSB7S2V5Ym9hcmRFdmVudH0gTm9ybWFsaXplZCBrZXlkb3duIGV2ZW50LlxuICAgKi9cbiAgcHJpdmF0ZSBfb25LZXlEb3duKGU6IEtleWJvYXJkRXZlbnQgfCBFdmVudCk6IHZvaWQge1xuICAgIGlmICgoZSBhcyBLZXlib2FyZEV2ZW50KS5rZXkgPT09IHRoaXMua2V5KSB7XG4gICAgICB0aGlzLmNsb3NlKCk7XG4gICAgfVxuICB9XG5cbiAgLy8gQXV0byBjb2xsYXBzZSBoYW5kbGVyc1xuICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG5cbiAgcHJpdmF0ZSBfaW5pdENvbGxhcHNlTGlzdGVuZXJzKCk6IHZvaWQge1xuICAgIGlmICh0aGlzLmF1dG9Db2xsYXBzZUhlaWdodCB8fCB0aGlzLmF1dG9Db2xsYXBzZVdpZHRoKSB7XG4gICAgICAvLyBJbiBhIHRpbWVvdXQgc28gdGhhdCB0aGluZ3MgcmVuZGVyIGZpcnN0XG4gICAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgaWYgKCF0aGlzLl9vblJlc2l6ZUF0dGFjaGVkKSB7XG4gICAgICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoXCJyZXNpemVcIiwgdGhpcy5fY29sbGFwc2UpO1xuICAgICAgICAgIHRoaXMuX29uUmVzaXplQXR0YWNoZWQgPSB0cnVlO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIF9kZXN0cm95Q29sbGFwc2VMaXN0ZW5lcnMoKTogdm9pZCB7XG4gICAgaWYgKHRoaXMuX29uUmVzaXplQXR0YWNoZWQpIHtcbiAgICAgIHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKFwicmVzaXplXCIsIHRoaXMuX2NvbGxhcHNlKTtcbiAgICAgIHRoaXMuX29uUmVzaXplQXR0YWNoZWQgPSBmYWxzZTtcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIF9jb2xsYXBzZSgpOiB2b2lkIHtcbiAgICBjb25zdCB3aW5IZWlnaHQ6IG51bWJlciA9IHdpbmRvdy5pbm5lckhlaWdodDtcbiAgICBjb25zdCB3aW5XaWR0aDogbnVtYmVyID0gd2luZG93LmlubmVyV2lkdGg7XG5cbiAgICBpZiAodGhpcy5hdXRvQ29sbGFwc2VIZWlnaHQpIHtcbiAgICAgIGlmICh3aW5IZWlnaHQgPD0gdGhpcy5hdXRvQ29sbGFwc2VIZWlnaHQgJiYgdGhpcy5vcGVuZWQpIHtcbiAgICAgICAgdGhpcy5fd2FzQ29sbGFwc2VkID0gdHJ1ZTtcbiAgICAgICAgdGhpcy5jbG9zZSgpO1xuICAgICAgfSBlbHNlIGlmICh3aW5IZWlnaHQgPiB0aGlzLmF1dG9Db2xsYXBzZUhlaWdodCAmJiB0aGlzLl93YXNDb2xsYXBzZWQpIHtcbiAgICAgICAgdGhpcy5vcGVuKCk7XG4gICAgICAgIHRoaXMuX3dhc0NvbGxhcHNlZCA9IGZhbHNlO1xuICAgICAgfVxuICAgIH1cblxuICAgIGlmICh0aGlzLmF1dG9Db2xsYXBzZVdpZHRoKSB7XG4gICAgICBpZiAod2luV2lkdGggPD0gdGhpcy5hdXRvQ29sbGFwc2VXaWR0aCAmJiB0aGlzLm9wZW5lZCkge1xuICAgICAgICB0aGlzLl93YXNDb2xsYXBzZWQgPSB0cnVlO1xuICAgICAgICB0aGlzLmNsb3NlKCk7XG4gICAgICB9IGVsc2UgaWYgKHdpbldpZHRoID4gdGhpcy5hdXRvQ29sbGFwc2VXaWR0aCAmJiB0aGlzLl93YXNDb2xsYXBzZWQpIHtcbiAgICAgICAgdGhpcy5vcGVuKCk7XG4gICAgICAgIHRoaXMuX3dhc0NvbGxhcHNlZCA9IGZhbHNlO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8vIEhlbHBlcnNcbiAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuXG4gIC8qKlxuICAgKiBAaW50ZXJuYWxcbiAgICpcbiAgICogUmV0dXJucyB0aGUgcmVuZGVyZWQgaGVpZ2h0IG9mIHRoZSBzaWRlYmFyIChvciB0aGUgZG9ja2VkIHNpemUpLlxuICAgKiBUaGlzIGlzIHVzZWQgaW4gdGhlIHNpZGViYXIgY29udGFpbmVyLlxuICAgKlxuICAgKiBAcmV0dXJuIHtudW1iZXJ9IEhlaWdodCBvZiBzaWRlYmFyLlxuICAgKi9cbiAgZ2V0IF9oZWlnaHQoKTogbnVtYmVyIHtcbiAgICBpZiAodGhpcy5fZWxTaWRlYmFyLm5hdGl2ZUVsZW1lbnQpIHtcbiAgICAgIHJldHVybiB0aGlzLl9pc0RvY2tlZFxuICAgICAgICA/IHRoaXMuX2RvY2tlZFNpemVcbiAgICAgICAgOiB0aGlzLl9lbFNpZGViYXIubmF0aXZlRWxlbWVudC5vZmZzZXRIZWlnaHQ7XG4gICAgfVxuXG4gICAgcmV0dXJuIDA7XG4gIH1cblxuICAvKipcbiAgICogQGludGVybmFsXG4gICAqXG4gICAqIFJldHVybnMgdGhlIHJlbmRlcmVkIHdpZHRoIG9mIHRoZSBzaWRlYmFyIChvciB0aGUgZG9ja2VkIHNpemUpLlxuICAgKiBUaGlzIGlzIHVzZWQgaW4gdGhlIHNpZGViYXIgY29udGFpbmVyLlxuICAgKlxuICAgKiBAcmV0dXJuIHtudW1iZXJ9IFdpZHRoIG9mIHNpZGViYXIuXG4gICAqL1xuICBnZXQgX3dpZHRoKCk6IG51bWJlciB7XG4gICAgaWYgKHRoaXMuX2VsU2lkZWJhci5uYXRpdmVFbGVtZW50KSB7XG4gICAgICByZXR1cm4gdGhpcy5faXNEb2NrZWRcbiAgICAgICAgPyB0aGlzLl9kb2NrZWRTaXplXG4gICAgICAgIDogdGhpcy5fZWxTaWRlYmFyLm5hdGl2ZUVsZW1lbnQub2Zmc2V0V2lkdGg7XG4gICAgfVxuXG4gICAgcmV0dXJuIDA7XG4gIH1cblxuICAvKipcbiAgICogQGludGVybmFsXG4gICAqXG4gICAqIFJldHVybnMgdGhlIGRvY2tlZCBzaXplIGFzIGEgbnVtYmVyLlxuICAgKlxuICAgKiBAcmV0dXJuIHtudW1iZXJ9IERvY2tlZCBzaXplLlxuICAgKi9cbiAgZ2V0IF9kb2NrZWRTaXplKCk6IG51bWJlciB7XG4gICAgcmV0dXJuIHBhcnNlRmxvYXQodGhpcy5kb2NrZWRTaXplKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBAaW50ZXJuYWxcbiAgICpcbiAgICogUmV0dXJucyB3aGV0aGVyIHRoZSBzaWRlYmFyIGlzIG92ZXIgbW9kZS5cbiAgICpcbiAgICogQHJldHVybiB7Ym9vbGVhbn0gU2lkZWJhcidzIG1vZGUgaXMgXCJvdmVyXCIuXG4gICAqL1xuICBnZXQgX2lzTW9kZU92ZXIoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMubW9kZSA9PT0gXCJvdmVyXCI7XG4gIH1cblxuICAvKipcbiAgICogQGludGVybmFsXG4gICAqXG4gICAqIFJldHVybnMgd2hldGhlciB0aGUgc2lkZWJhciBpcyBwdXNoIG1vZGUuXG4gICAqXG4gICAqIEByZXR1cm4ge2Jvb2xlYW59IFNpZGViYXIncyBtb2RlIGlzIFwicHVzaFwiLlxuICAgKi9cbiAgZ2V0IF9pc01vZGVQdXNoKCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLm1vZGUgPT09IFwicHVzaFwiO1xuICB9XG5cbiAgLyoqXG4gICAqIEBpbnRlcm5hbFxuICAgKlxuICAgKiBSZXR1cm5zIHdoZXRoZXIgdGhlIHNpZGViYXIgaXMgc2xpZGUgbW9kZS5cbiAgICpcbiAgICogQHJldHVybiB7Ym9vbGVhbn0gU2lkZWJhcidzIG1vZGUgaXMgXCJzbGlkZVwiLlxuICAgKi9cbiAgZ2V0IF9pc01vZGVTbGlkZSgpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5tb2RlID09PSBcInNsaWRlXCI7XG4gIH1cblxuICAvKipcbiAgICogQGludGVybmFsXG4gICAqXG4gICAqIFJldHVybnMgd2hldGhlciB0aGUgc2lkZWJhciBpcyBcImRvY2tlZFwiIC0tIGkuZS4gaXQgaXMgY2xvc2VkIGJ1dCBpbiBkb2NrIG1vZGUuXG4gICAqXG4gICAqIEByZXR1cm4ge2Jvb2xlYW59IFNpZGViYXIgaXMgZG9ja2VkLlxuICAgKi9cbiAgZ2V0IF9pc0RvY2tlZCgpOiBib29sZWFuIHtcbiAgICByZXR1cm4gISEodGhpcy5kb2NrICYmIHRoaXMuX2RvY2tlZFNpemUgPiAwICYmICF0aGlzLm9wZW5lZCk7XG4gIH1cblxuICAvKipcbiAgICogQGludGVybmFsXG4gICAqXG4gICAqIFJldHVybnMgd2hldGhlciB0aGUgc2lkZWJhciBpcyBwb3NpdGlvbmVkIGF0IHRoZSBsZWZ0IG9yIHRvcC5cbiAgICpcbiAgICogQHJldHVybiB7Ym9vbGVhbn0gU2lkZWJhciBpcyBwb3NpdGlvbmVkIGF0IHRoZSBsZWZ0IG9yIHRvcC5cbiAgICovXG4gIGdldCBfaXNMZWZ0T3JUb3AoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMucG9zaXRpb24gPT09IFwibGVmdFwiIHx8IHRoaXMucG9zaXRpb24gPT09IFwidG9wXCI7XG4gIH1cblxuICAvKipcbiAgICogQGludGVybmFsXG4gICAqXG4gICAqIFJldHVybnMgd2hldGhlciB0aGUgc2lkZWJhciBpcyBwb3NpdGlvbmVkIGF0IHRoZSBsZWZ0IG9yIHJpZ2h0LlxuICAgKlxuICAgKiBAcmV0dXJuIHtib29sZWFufSBTaWRlYmFyIGlzIHBvc2l0aW9uZWQgYXQgdGhlIGxlZnQgb3IgcmlnaHQuXG4gICAqL1xuICBnZXQgX2lzTGVmdE9yUmlnaHQoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMucG9zaXRpb24gPT09IFwibGVmdFwiIHx8IHRoaXMucG9zaXRpb24gPT09IFwicmlnaHRcIjtcbiAgfVxuXG4gIC8qKlxuICAgKiBAaW50ZXJuYWxcbiAgICpcbiAgICogUmV0dXJucyB3aGV0aGVyIHRoZSBzaWRlYmFyIGlzIGluZXJ0IC0tIGkuZS4gdGhlIGNvbnRlbnRzIGNhbm5vdCBiZSBmb2N1c2VkLlxuICAgKlxuICAgKiBAcmV0dXJuIHtib29sZWFufSBTaWRlYmFyIGlzIGluZXJ0LlxuICAgKi9cbiAgZ2V0IF9pc0luZXJ0KCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiAhdGhpcy5vcGVuZWQgJiYgIXRoaXMuZG9jaztcbiAgfVxuXG4gIC8qKlxuICAgKiBcIk5vcm1hbGl6ZXNcIiBwb3NpdGlvbi4gRm9yIGV4YW1wbGUsIFwic3RhcnRcIiB3b3VsZCBiZSBcImxlZnRcIiBpZiB0aGUgcGFnZSBpcyBMVFIuXG4gICAqL1xuICBwcml2YXRlIF9ub3JtYWxpemVQb3NpdGlvbigpOiB2b2lkIHtcbiAgICBjb25zdCBsdHI6IGJvb2xlYW4gPSBpc0xUUigpO1xuXG4gICAgaWYgKHRoaXMucG9zaXRpb24gPT09IFwic3RhcnRcIikge1xuICAgICAgdGhpcy5wb3NpdGlvbiA9IGx0ciA/IFwibGVmdFwiIDogXCJyaWdodFwiO1xuICAgIH0gZWxzZSBpZiAodGhpcy5wb3NpdGlvbiA9PT0gXCJlbmRcIikge1xuICAgICAgdGhpcy5wb3NpdGlvbiA9IGx0ciA/IFwicmlnaHRcIiA6IFwibGVmdFwiO1xuICAgIH1cbiAgfVxufVxuIl19