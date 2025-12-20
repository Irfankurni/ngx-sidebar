import * as i0 from '@angular/core';
import { EventEmitter, PLATFORM_ID, Component, ChangeDetectionStrategy, Inject, Input, Output, Optional, ViewChild, Directive, NgModule } from '@angular/core';
import * as i1 from '@angular/common';
import { isPlatformBrowser, CommonModule } from '@angular/common';

// Based on https://github.com/angular/material2/tree/master/src/lib/sidenav
class SidebarContainer {
    _ref;
    animate = true;
    allowSidebarBackdropControl = true;
    showBackdrop = false;
    showBackdropChange = new EventEmitter();
    onBackdropClicked = new EventEmitter();
    contentClass;
    backdropClass;
    _sidebars = [];
    _subscriptions = new Map();
    _isBrowser;
    constructor(_ref, platformId) {
        this._ref = _ref;
        this._isBrowser = isPlatformBrowser(platformId);
    }
    ngAfterContentInit() {
        if (!this._isBrowser) {
            return;
        }
        this._onToggle();
    }
    ngOnChanges(changes) {
        if (!this._isBrowser) {
            return;
        }
        if (changes["showBackdrop"]) {
            this.showBackdropChange.emit(changes["showBackdrop"].currentValue);
        }
    }
    ngOnDestroy() {
        if (!this._isBrowser) {
            return;
        }
        this._unsubscribe();
    }
    /**
     * @internal
     *
     * Adds a sidebar to the container's list of sidebars.
     *
     * @param sidebar {Sidebar} A sidebar within the container to register.
     */
    _addSidebar(sidebar) {
        this._sidebars.push(sidebar);
        this._subscribe(sidebar);
    }
    /**
     * @internal
     *
     * Removes a sidebar from the container's list of sidebars.
     *
     * @param sidebar {Sidebar} The sidebar to remove.
     */
    _removeSidebar(sidebar) {
        const index = this._sidebars.indexOf(sidebar);
        if (index !== -1) {
            this._sidebars.splice(index, 1);
            this._unsubscribe(sidebar);
        }
    }
    /**
     * @internal
     *
     * Computes `margin` value to push page contents to accommodate open sidebars as needed.
     *
     * @return {CSSStyleDeclaration} margin styles for the page content.
     */
    _getContentStyle() {
        let left = 0, right = 0, top = 0, bottom = 0;
        let transformStyle = "";
        let heightStyle = "";
        let widthStyle = "";
        for (const sidebar of this._sidebars) {
            // Slide mode: we need to translate the entire container
            if (sidebar._isModeSlide) {
                if (sidebar.opened) {
                    const transformDir = sidebar._isLeftOrRight ? "X" : "Y";
                    const transformAmt = `${sidebar._isLeftOrTop ? "" : "-"}${sidebar._isLeftOrRight ? sidebar._width : sidebar._height}`;
                    transformStyle = `translate${transformDir}(${transformAmt}px)`;
                }
            }
            // Create a space for the sidebar
            if ((sidebar._isModePush && sidebar.opened) || sidebar.dock) {
                let paddingAmt = 0;
                if (sidebar._isModeSlide && sidebar.opened) {
                    if (sidebar._isLeftOrRight) {
                        widthStyle = "100%";
                    }
                    else {
                        heightStyle = "100%";
                    }
                }
                else {
                    if (sidebar._isDocked || (sidebar._isModeOver && sidebar.dock)) {
                        paddingAmt = sidebar._dockedSize;
                    }
                    else {
                        paddingAmt = sidebar._isLeftOrRight
                            ? sidebar._width
                            : sidebar._height;
                    }
                }
                switch (sidebar.position) {
                    case "left":
                        left = Math.max(left, paddingAmt);
                        break;
                    case "right":
                        right = Math.max(right, paddingAmt);
                        break;
                    case "top":
                        top = Math.max(top, paddingAmt);
                        break;
                    case "bottom":
                        bottom = Math.max(bottom, paddingAmt);
                        break;
                }
            }
        }
        return {
            padding: `${top}px ${right}px ${bottom}px ${left}px`,
            webkitTransform: transformStyle,
            transform: transformStyle,
            height: heightStyle,
            width: widthStyle,
        };
    }
    /**
     * @internal
     *
     * Closes sidebars when the backdrop is clicked, if they have the
     * `closeOnClickBackdrop` option set.
     */
    _onBackdropClicked() {
        let backdropClicked = false;
        for (const sidebar of this._sidebars) {
            if (sidebar.opened &&
                sidebar.showBackdrop &&
                sidebar.closeOnClickBackdrop) {
                sidebar.close();
                backdropClicked = true;
            }
        }
        if (backdropClicked) {
            this.onBackdropClicked.emit();
        }
    }
    /**
     * Subscribes from a sidebar events to react properly.
     */
    _subscribe(sidebar) {
        const subs = [
            sidebar.onOpenStart.subscribe(() => this._onToggle()),
            sidebar.onOpened.subscribe(() => this._markForCheck()),
            sidebar.onCloseStart.subscribe(() => this._onToggle()),
            sidebar.onClosed.subscribe(() => this._markForCheck()),
            sidebar.onModeChange.subscribe(() => this._markForCheck()),
            sidebar.onPositionChange.subscribe(() => this._markForCheck()),
            sidebar._onRerender.subscribe(() => this._markForCheck()),
        ];
        this._subscriptions.set(sidebar, subs);
    }
    /**
     * Unsubscribes from all sidebars.
     */
    _unsubscribe(sidebar) {
        if (sidebar) {
            const subs = this._subscriptions.get(sidebar);
            if (subs) {
                subs.forEach((s) => s.unsubscribe());
                this._subscriptions.delete(sidebar);
            }
        }
        else {
            this._subscriptions.forEach((subs) => subs.forEach((s) => s.unsubscribe()));
            this._subscriptions.clear();
        }
    }
    /**
     * Check if we should show the backdrop when a sidebar is toggled.
     */
    _onToggle() {
        if (this._sidebars.length > 0 && this.allowSidebarBackdropControl) {
            // Show backdrop if a single open sidebar has it set
            const hasOpen = this._sidebars.some((sidebar) => sidebar.opened && sidebar.showBackdrop);
            this.showBackdrop = hasOpen;
            this.showBackdropChange.emit(hasOpen);
        }
        setTimeout(() => {
            this._markForCheck();
        });
    }
    /**
     * Triggers change detection to recompute styles.
     */
    _markForCheck() {
        this._ref.markForCheck();
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.2.14", ngImport: i0, type: SidebarContainer, deps: [{ token: i0.ChangeDetectorRef }, { token: PLATFORM_ID }], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "18.2.14", type: SidebarContainer, isStandalone: true, selector: "ng-sidebar-container", inputs: { animate: "animate", allowSidebarBackdropControl: "allowSidebarBackdropControl", showBackdrop: "showBackdrop", contentClass: "contentClass", backdropClass: "backdropClass" }, outputs: { showBackdropChange: "showBackdropChange", onBackdropClicked: "onBackdropClicked" }, usesOnChanges: true, ngImport: i0, template: `
    <div
      *ngIf="showBackdrop"
      aria-hidden="true"
      class="ng-sidebar__backdrop"
      [ngClass]="backdropClass"
      (click)="_onBackdropClicked()"
    ></div>

    <ng-content select="ng-sidebar,[ng-sidebar]"></ng-content>

    <div
      class="ng-sidebar__content"
      [class.ng-sidebar__content--animate]="animate"
      [ngClass]="contentClass"
      [ngStyle]="_getContentStyle()"
    >
      <ng-content select="[ng-sidebar-content]"></ng-content>
    </div>
  `, isInline: true, styles: [":host{box-sizing:border-box;display:block;position:relative;height:100%;width:100%;overflow:hidden}.ng-sidebar__backdrop{position:absolute;inset:0;background:#000;opacity:.75;pointer-events:auto;z-index:1}.ng-sidebar__content{-webkit-overflow-scrolling:touch;overflow:auto;position:absolute;inset:0}.ng-sidebar__content--animate{-webkit-transition:-webkit-transform .3s cubic-bezier(0,0,.3,1),padding .3s cubic-bezier(0,0,.3,1);transition:transform .3s cubic-bezier(0,0,.3,1),padding .3s cubic-bezier(0,0,.3,1)}\n"], dependencies: [{ kind: "ngmodule", type: CommonModule }, { kind: "directive", type: i1.NgClass, selector: "[ngClass]", inputs: ["class", "ngClass"] }, { kind: "directive", type: i1.NgIf, selector: "[ngIf]", inputs: ["ngIf", "ngIfThen", "ngIfElse"] }, { kind: "directive", type: i1.NgStyle, selector: "[ngStyle]", inputs: ["ngStyle"] }], changeDetection: i0.ChangeDetectionStrategy.OnPush });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.2.14", ngImport: i0, type: SidebarContainer, decorators: [{
            type: Component,
            args: [{ selector: "ng-sidebar-container", template: `
    <div
      *ngIf="showBackdrop"
      aria-hidden="true"
      class="ng-sidebar__backdrop"
      [ngClass]="backdropClass"
      (click)="_onBackdropClicked()"
    ></div>

    <ng-content select="ng-sidebar,[ng-sidebar]"></ng-content>

    <div
      class="ng-sidebar__content"
      [class.ng-sidebar__content--animate]="animate"
      [ngClass]="contentClass"
      [ngStyle]="_getContentStyle()"
    >
      <ng-content select="[ng-sidebar-content]"></ng-content>
    </div>
  `, changeDetection: ChangeDetectionStrategy.OnPush, standalone: true, imports: [CommonModule], styles: [":host{box-sizing:border-box;display:block;position:relative;height:100%;width:100%;overflow:hidden}.ng-sidebar__backdrop{position:absolute;inset:0;background:#000;opacity:.75;pointer-events:auto;z-index:1}.ng-sidebar__content{-webkit-overflow-scrolling:touch;overflow:auto;position:absolute;inset:0}.ng-sidebar__content--animate{-webkit-transition:-webkit-transform .3s cubic-bezier(0,0,.3,1),padding .3s cubic-bezier(0,0,.3,1);transition:transform .3s cubic-bezier(0,0,.3,1),padding .3s cubic-bezier(0,0,.3,1)}\n"] }]
        }], ctorParameters: () => [{ type: i0.ChangeDetectorRef }, { type: Object, decorators: [{
                    type: Inject,
                    args: [PLATFORM_ID]
                }] }], propDecorators: { animate: [{
                type: Input
            }], allowSidebarBackdropControl: [{
                type: Input
            }], showBackdrop: [{
                type: Input
            }], showBackdropChange: [{
                type: Output
            }], onBackdropClicked: [{
                type: Output
            }], contentClass: [{
                type: Input
            }], backdropClass: [{
                type: Input
            }] } });

/**
 * Returns whether the page is in LTR mode. Defaults to `true` if it can't be computed.
 *
 * @return {boolean} Page's language direction is left-to-right.
 */
function isLTR() {
    let dir = 'ltr';
    if (typeof window !== 'undefined') {
        if (window.getComputedStyle) {
            dir = window.getComputedStyle(document.body, null).getPropertyValue('direction');
        }
        else {
            dir = document.body.currentStyle.direction;
        }
    }
    return dir === 'ltr';
}
/**
 * Returns whether or not the current device is an iOS device.
 *
 * @return {boolean} Device is an iOS device (i.e. iPod touch/iPhone/iPad).
 */
function isIOS() {
    if (typeof window !== 'undefined' && typeof navigator !== 'undefined') {
        return /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    }
    return false;
}

class Sidebar {
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
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.2.14", ngImport: i0, type: Sidebar, deps: [{ token: SidebarContainer, optional: true }, { token: i0.ChangeDetectorRef }, { token: PLATFORM_ID }], target: i0.ɵɵFactoryTarget.Component });
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
  `, isInline: true, styles: [".ng-sidebar{-webkit-overflow-scrolling:touch;overflow:auto;pointer-events:auto;position:absolute;touch-action:auto;will-change:initial;z-index:2}.ng-sidebar--left{bottom:0;left:0;top:0}.ng-sidebar--right{bottom:0;right:0;top:0}.ng-sidebar--top{left:0;right:0;top:0}.ng-sidebar--bottom{bottom:0;left:0;right:0}.ng-sidebar--inert{pointer-events:none;touch-action:none;will-change:transform}.ng-sidebar--animate{-webkit-transition:-webkit-transform .3s cubic-bezier(0,0,.3,1);transition:transform .3s cubic-bezier(0,0,.3,1)}\n"], dependencies: [{ kind: "ngmodule", type: CommonModule }, { kind: "directive", type: i1.NgClass, selector: "[ngClass]", inputs: ["class", "ngClass"] }, { kind: "directive", type: i1.NgStyle, selector: "[ngStyle]", inputs: ["ngStyle"] }], changeDetection: i0.ChangeDetectionStrategy.OnPush });
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
        }], ctorParameters: () => [{ type: SidebarContainer, decorators: [{
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

class CloseSidebar {
    _sidebar;
    constructor(_sidebar) {
        this._sidebar = _sidebar;
    }
    /** @internal */
    _onClick() {
        if (this._sidebar) {
            this._sidebar.close();
        }
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.2.14", ngImport: i0, type: CloseSidebar, deps: [{ token: Sidebar }], target: i0.ɵɵFactoryTarget.Directive });
    static ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "18.2.14", type: CloseSidebar, isStandalone: true, selector: "[closeSidebar]", host: { listeners: { "click": "_onClick()" } }, ngImport: i0 });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.2.14", ngImport: i0, type: CloseSidebar, decorators: [{
            type: Directive,
            args: [{
                    selector: "[closeSidebar]",
                    host: {
                        "(click)": "_onClick()",
                    },
                    standalone: true,
                }]
        }], ctorParameters: () => [{ type: Sidebar }] });

class SidebarModule {
    static forRoot() {
        return {
            ngModule: SidebarModule,
        };
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.2.14", ngImport: i0, type: SidebarModule, deps: [], target: i0.ɵɵFactoryTarget.NgModule });
    static ɵmod = i0.ɵɵngDeclareNgModule({ minVersion: "14.0.0", version: "18.2.14", ngImport: i0, type: SidebarModule, imports: [SidebarContainer, Sidebar, CloseSidebar], exports: [SidebarContainer, Sidebar, CloseSidebar] });
    static ɵinj = i0.ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "18.2.14", ngImport: i0, type: SidebarModule, imports: [SidebarContainer, Sidebar] });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.2.14", ngImport: i0, type: SidebarModule, decorators: [{
            type: NgModule,
            args: [{
                    imports: [SidebarContainer, Sidebar, CloseSidebar],
                    exports: [SidebarContainer, Sidebar, CloseSidebar],
                }]
        }] });

/**
 * Generated bundle index. Do not edit.
 */

export { CloseSidebar, Sidebar, SidebarContainer, SidebarModule };
//# sourceMappingURL=ngx-sidebar-ng-sidebar.mjs.map
