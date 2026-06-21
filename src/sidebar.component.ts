import {
  AfterContentInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  Optional,
  ViewChild,
  input,
  model,
  output,
  effect,
  afterNextRender,
  untracked,
  signal,
  computed
} from "@angular/core";
import { CommonModule } from "@angular/common";

import { SidebarContainer } from "./sidebar-container.component";
import { isLTR, isIOS } from "./utils";

@Component({
  selector: "ng-sidebar",
  template: `
    <aside
      #sidebar
      role="complementary"
      [attr.aria-hidden]="!opened()"
      [attr.aria-label]="ariaLabel()"
      class="ng-sidebar ng-sidebar--{{
        opened() ? 'opened' : 'closed'
      }} ng-sidebar--{{ _normalizedPosition() }} ng-sidebar--{{ mode() }}"
      [class.ng-sidebar--docked]="_isDocked()"
      [class.ng-sidebar--inert]="_isInert()"
      [class.ng-sidebar--animate]="_isAnimating()"
      [ngClass]="sidebarClass()"
      [ngStyle]="_getStyle()"
    >
      <ng-content></ng-content>
    </aside>
  `,
  styles: [
    `
      .ng-sidebar {
        -webkit-overflow-scrolling: touch;
        overflow: auto;
        pointer-events: auto;
        position: absolute;
        touch-action: auto;
        will-change: initial;
        z-index: 2;
      }

      .ng-sidebar--left {
        bottom: 0;
        left: 0;
        top: 0;
      }

      .ng-sidebar--right {
        bottom: 0;
        right: 0;
        top: 0;
      }

      .ng-sidebar--top {
        left: 0;
        right: 0;
        top: 0;
      }

      .ng-sidebar--bottom {
        bottom: 0;
        left: 0;
        right: 0;
      }

      .ng-sidebar--inert {
        pointer-events: none;
        touch-action: none;
        will-change: transform;
      }

      .ng-sidebar--animate {
        -webkit-transition: -webkit-transform var(--ng-sidebar-transition-duration, 0.3s) cubic-bezier(0, 0, 0.3, 1);
        transition: transform var(--ng-sidebar-transition-duration, 0.3s) cubic-bezier(0, 0, 0.3, 1);
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [CommonModule],
})
export class Sidebar implements AfterContentInit, OnInit, OnDestroy {
  // `opened` allows for "2-way" data binding
  opened = model<boolean>(false);

  mode = input<"over" | "push" | "slide">("over");
  dock = input<boolean>(false);
  dockedSize = input<string>("0px");
  position = input<"start" | "end" | "left" | "right" | "top" | "bottom">("start");
  animate = input<boolean>(true);

  autoCollapseHeight = input<number>();
  autoCollapseWidth = input<number>();
  autoCollapseOnInit = input<boolean>(true);

  sidebarClass = input<string>();
  ariaLabel = input<string>();
  trapFocus = input<boolean>(false);
  autoFocus = input<boolean>(true);

  showBackdrop = input<boolean>(false);
  closeOnClickBackdrop = input<boolean>(false);
  closeOnClickOutside = input<boolean>(false);

  keyClose = input<boolean>(false);
  key = input<string>("Escape"); // Default to Escape key

  onContentInit = output<void>();
  onOpenStart = output<void>();
  onOpened = output<void>();
  onCloseStart = output<void>();
  onClosed = output<void>();
  onTransitionEnd = output<void>();
  onModeChange = output<string>();
  onPositionChange = output<string>();

  /** @internal */
  _onRerender = output<void>();

  /** @internal */
  @ViewChild("sidebar", { static: false }) _elSidebar!: ElementRef<HTMLElement>;

  private _focusableElementsString: string =
    "a[href], area[href], input:not([disabled]), select:not([disabled])," +
    "textarea:not([disabled]), button:not([disabled]), iframe, object, embed, [tabindex], [contenteditable]";
  private _focusableElements?: Array<HTMLElement>;
  private _focusedBeforeOpen: HTMLElement | null = null;

  private _tabIndexAttr: string = "__tabindex__";
  private _tabIndexIndicatorAttr: string = "__ngsidebar-tabindex__";

  private _wasCollapsed: boolean = false;

  // Internal state for animating
  _isAnimating = signal<boolean>(false);

  private _clickEvent: string = "click";
  private _onClickOutsideAttached: boolean = false;
  private _onKeyDownAttached: boolean = false;
  private _onResizeAttached: boolean = false;

  _normalizedPosition = computed(() => {
    const pos = this.position();
    const ltr: boolean = isLTR();
    if (pos === "start") {
      return ltr ? "left" : "right";
    } else if (pos === "end") {
      return ltr ? "right" : "left";
    }
    return pos;
  });

  constructor(
    @Optional() public _container: SidebarContainer,
    private _ref: ChangeDetectorRef
  ) {
    if (!this._container) {
      throw new Error(
        "<ng-sidebar> must be inside a <ng-sidebar-container>. " +
          "See https://github.com/arkon/ng-sidebar#usage for more info."
      );
    }

    this.open = this.open.bind(this);
    this.close = this.close.bind(this);
    this._onTransitionEnd = this._onTransitionEnd.bind(this);
    this._onFocusTrap = this._onFocusTrap.bind(this);
    this._onClickOutside = this._onClickOutside.bind(this);
    this._onKeyDown = this._onKeyDown.bind(this);
    this._collapse = this._collapse.bind(this);

    // Setup effects for inputs
    effect(() => {
      const closeOutside = this.closeOnClickOutside();
      untracked(() => {
        if (closeOutside) {
          this._initCloseClickListener();
        } else {
          this._destroyCloseClickListener();
        }
      });
    });

    effect(() => {
      const keyClose = this.keyClose();
      untracked(() => {
        if (keyClose) {
          this._initCloseKeyDownListener();
        } else {
          this._destroyCloseKeyDownListener();
        }
      });
    });

    effect(() => {
      const pos = this._normalizedPosition();
      untracked(() => {
        setTimeout(() => this.onPositionChange.emit(pos));
      });
    });

    effect(() => {
      const m = this.mode();
      untracked(() => {
        setTimeout(() => this.onModeChange.emit(m));
      });
    });

    effect(() => {
      this.dock();
      untracked(() => this.triggerRerender());
    });

    effect(() => {
      const isOpened = this.opened();
      untracked(() => {
        if (this.animate() && !this._isAnimating()) {
          this._isAnimating.set(true);
        }

        if (isOpened) {
          this.open();
        } else {
          this.close();
        }
      });
    });

    effect(() => {
      this.autoCollapseHeight();
      this.autoCollapseWidth();
      untracked(() => this._initCollapseListeners());
    });

    afterNextRender(() => {
      // Handle taps in iOS
      if (isIOS() && !("onclick" in window)) {
        this._clickEvent = "touchstart";
      }

      if (this.animate()) {
        setTimeout(() => {
          this._isAnimating.set(true);
        }, 50);
      }

      if (this.autoCollapseOnInit()) {
        this._collapse();
      }
    });
  }

  ngOnInit(): void {
    this._container._addSidebar(this);
  }

  ngAfterContentInit(): void {
    this.onContentInit.emit();
  }

  ngOnDestroy(): void {
    this._destroyCloseListeners();
    this._destroyCollapseListeners();
    this._container._removeSidebar(this);
  }

  // Sidebar toggling
  // ==============================================================================================

  /**
   * Opens the sidebar and emits the appropriate events.
   */
  open(): void {
    this.opened.set(true);

    this.onOpenStart.emit();

    this._ref.detectChanges();

    setTimeout(() => {
      if (this.animate() && !this._isModeSlide()) {
        if (this._elSidebar?.nativeElement) {
          this._elSidebar.nativeElement.addEventListener(
            "transitionend",
            this._onTransitionEnd
          );
        }
      } else {
        this._setFocused();
        this._initCloseListeners();

        if (this.opened()) {
          this.onOpened.emit();
        }
      }
    });
  }

  /**
   * Closes the sidebar and emits the appropriate events.
   */
  close(): void {
    this.opened.set(false);

    this.onCloseStart.emit();

    this._ref.detectChanges();

    setTimeout(() => {
      if (this.animate() && !this._isModeSlide()) {
        if (this._elSidebar?.nativeElement) {
          this._elSidebar.nativeElement.addEventListener(
            "transitionend",
            this._onTransitionEnd
          );
        }
      } else {
        this._setFocused();
        this._destroyCloseListeners();

        if (!this.opened()) {
          this.onClosed.emit();
        }
      }
    });
  }

  /**
   * Manually trigger a re-render of the container. Useful if the sidebar contents might change.
   */
  triggerRerender(): void {
    setTimeout(() => {
      this._onRerender.emit();
    });
  }

  /**
   * @internal
   */
  _getStyle(): Record<string, string> {
    let transformStyle: string = "";

    if (!this.opened()) {
      const transformDir: string = "translate" + (this._isLeftOrRight() ? "X" : "Y");
      let translateAmt: string = `${this._isLeftOrTop() ? "-" : ""}100%`;

      transformStyle = `${transformDir}(${translateAmt})`;

      if (
        this.dock() &&
        this._dockedSize() > 0 &&
        !(this._isModeSlide() && this.opened())
      ) {
        transformStyle += ` ${transformDir}(${this._isLeftOrTop() ? "+" : "-"}${
          this.dockedSize()
        })`;
      }
    }

    return {
      webkitTransform: transformStyle,
      transform: transformStyle,
    };
  }

  /**
   * @internal
   */
  _onTransitionEnd(e: TransitionEvent): void {
    if (
      e.target === this._elSidebar.nativeElement &&
      e.propertyName.endsWith("transform")
    ) {
      this._setFocused();

      if (this.opened()) {
        this._initCloseListeners();
        this.onOpened.emit();
      } else {
        this._destroyCloseListeners();
        this.onClosed.emit();
      }

      this.onTransitionEnd.emit();

      this._elSidebar.nativeElement.removeEventListener(
        "transitionend",
        this._onTransitionEnd
      );
    }
  }

  // Focus on open/close
  // ==============================================================================================

  private get _shouldTrapFocus(): boolean {
    return this.opened() && this.trapFocus();
  }

  private _focusFirstItem(): void {
    if (this._focusableElements && this._focusableElements.length > 0) {
      this._focusableElements[0].focus();
    }
  }

  private _onFocusTrap(e: FocusEvent): void {
    if (
      this._shouldTrapFocus &&
      this._elSidebar?.nativeElement &&
      !this._elSidebar.nativeElement.contains(e.target as Node)
    ) {
      this._focusFirstItem();
    }
  }

  private _setFocused(): void {
    if (!this._elSidebar?.nativeElement) return;
    
    this._focusableElements = Array.from(
      this._elSidebar.nativeElement.querySelectorAll(
        this._focusableElementsString
      )
    ) as Array<HTMLElement>;

    if (this.opened()) {
      this._focusedBeforeOpen = document.activeElement as HTMLElement;

      for (const el of this._focusableElements) {
        const prevTabIndex = el.getAttribute(this._tabIndexAttr);
        const wasTabIndexSet =
          el.getAttribute(this._tabIndexIndicatorAttr) !== null;
        if (prevTabIndex !== null) {
          el.setAttribute("tabindex", prevTabIndex);
          el.removeAttribute(this._tabIndexAttr);
        } else if (wasTabIndexSet) {
          el.removeAttribute("tabindex");
          el.removeAttribute(this._tabIndexIndicatorAttr);
        }
      }

      if (this.autoFocus()) {
        this._focusFirstItem();
      }

      document.addEventListener("focus", this._onFocusTrap, true);
    } else {
      for (const el of this._focusableElements) {
        const existingTabIndex = el.getAttribute("tabindex");
        el.setAttribute("tabindex", "-1");
        el.setAttribute(this._tabIndexIndicatorAttr, "");

        if (existingTabIndex !== null) {
          el.setAttribute(this._tabIndexAttr, existingTabIndex);
        }
      }

      document.removeEventListener("focus", this._onFocusTrap, true);

      if (this._focusedBeforeOpen && this.autoFocus() && this._isModeOver()) {
        this._focusedBeforeOpen.focus();
        this._focusedBeforeOpen = null;
      }
    }
  }

  // Close event handlers
  // ==============================================================================================

  private _initCloseListeners(): void {
    this._initCloseClickListener();
    this._initCloseKeyDownListener();
  }

  private _initCloseClickListener(): void {
    setTimeout(() => {
      if (
        this.opened() &&
        this.closeOnClickOutside() &&
        !this._onClickOutsideAttached
      ) {
        document.addEventListener(this._clickEvent, this._onClickOutside);
        this._onClickOutsideAttached = true;
      }
    });
  }

  private _initCloseKeyDownListener(): void {
    setTimeout(() => {
      if (this.opened() && this.keyClose() && !this._onKeyDownAttached) {
        document.addEventListener("keydown", this._onKeyDown);
        this._onKeyDownAttached = true;
      }
    });
  }

  private _destroyCloseListeners(): void {
    this._destroyCloseClickListener();
    this._destroyCloseKeyDownListener();
  }

  private _destroyCloseClickListener(): void {
    if (this._onClickOutsideAttached) {
      document.removeEventListener(this._clickEvent, this._onClickOutside);
      this._onClickOutsideAttached = false;
    }
  }

  private _destroyCloseKeyDownListener(): void {
    if (this._onKeyDownAttached) {
      document.removeEventListener("keydown", this._onKeyDown);
      this._onKeyDownAttached = false;
    }
  }

  private _onClickOutside(e: MouseEvent | Event): void {
    if (
      this._onClickOutsideAttached &&
      this._elSidebar &&
      !this._elSidebar.nativeElement.contains(e.target as Node)
    ) {
      this.close();
    }
  }

  private _onKeyDown(e: KeyboardEvent | Event): void {
    if ((e as KeyboardEvent).key === this.key()) {
      this.close();
    }
  }

  // Auto collapse handlers
  // ==============================================================================================

  private _initCollapseListeners(): void {
    if (this.autoCollapseHeight() !== undefined || this.autoCollapseWidth() !== undefined) {
      setTimeout(() => {
        if (!this._onResizeAttached) {
          window.addEventListener("resize", this._collapse);
          this._onResizeAttached = true;
        }
      });
    }
  }

  private _destroyCollapseListeners(): void {
    if (this._onResizeAttached) {
      window.removeEventListener("resize", this._collapse);
      this._onResizeAttached = false;
    }
  }

  private _collapse(): void {
    const winHeight: number = window.innerHeight;
    const winWidth: number = window.innerWidth;
    const h = this.autoCollapseHeight();
    const w = this.autoCollapseWidth();

    if (h !== undefined) {
      if (winHeight <= h && this.opened()) {
        this._wasCollapsed = true;
        this.close();
      } else if (winHeight > h && this._wasCollapsed) {
        this.open();
        this._wasCollapsed = false;
      }
    }

    if (w !== undefined) {
      if (winWidth <= w && this.opened()) {
        this._wasCollapsed = true;
        this.close();
      } else if (winWidth > w && this._wasCollapsed) {
        this.open();
        this._wasCollapsed = false;
      }
    }
  }

  // Helpers
  // ==============================================================================================

  get _height(): number {
    if (this._elSidebar?.nativeElement) {
      return this._isDocked()
        ? this._dockedSize()
        : this._elSidebar.nativeElement.offsetHeight;
    }
    return 0;
  }

  get _width(): number {
    if (this._elSidebar?.nativeElement) {
      return this._isDocked()
        ? this._dockedSize()
        : this._elSidebar.nativeElement.offsetWidth;
    }
    return 0;
  }

  _dockedSize(): number {
    return parseFloat(this.dockedSize());
  }

  _isModeOver(): boolean {
    return this.mode() === "over";
  }

  _isModePush(): boolean {
    return this.mode() === "push";
  }

  _isModeSlide(): boolean {
    return this.mode() === "slide";
  }

  _isDocked(): boolean {
    return !!(this.dock() && this._dockedSize() > 0 && !this.opened());
  }

  _isLeftOrTop(): boolean {
    const pos = this._normalizedPosition();
    return pos === "left" || pos === "top";
  }

  _isLeftOrRight(): boolean {
    const pos = this._normalizedPosition();
    return pos === "left" || pos === "right";
  }

  _isInert(): boolean {
    return !this.opened() && !this.dock();
  }
}
