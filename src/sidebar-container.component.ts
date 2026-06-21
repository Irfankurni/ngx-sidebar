import {
  AfterContentInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnDestroy,
  input,
  output,
  effect,
  afterNextRender,
  untracked,
  model
} from "@angular/core";
import { CommonModule } from "@angular/common";


import { Sidebar } from "./sidebar.component";

@Component({
  selector: "ng-sidebar-container",
  template: `
    @if (showBackdrop()) {
      <div
        aria-hidden="true"
        class="ng-sidebar__backdrop"
        [ngClass]="backdropClass()"
        (click)="_onBackdropClicked()"
      ></div>
    }

    <ng-content select="ng-sidebar,[ng-sidebar]"></ng-content>

    <div
      class="ng-sidebar__content"
      [class.ng-sidebar__content--animate]="animate()"
      [ngClass]="contentClass()"
      [ngStyle]="_getContentStyle()"
    >
      <ng-content select="[ng-sidebar-content]"></ng-content>
    </div>
  `,
  styles: [
    `
      :host {
        box-sizing: border-box;
        display: block;
        position: relative;
        height: 100%;
        width: 100%;
        overflow: hidden;
      }

      .ng-sidebar__backdrop {
        position: absolute;
        top: 0;
        bottom: 0;
        left: 0;
        right: 0;
        background: var(--ng-sidebar-backdrop-bg, #000);
        opacity: var(--ng-sidebar-backdrop-opacity, 0.75);
        pointer-events: auto;
        z-index: 1;
      }

      .ng-sidebar__content {
        -webkit-overflow-scrolling: touch;
        overflow: auto;
        position: absolute;
        top: 0;
        bottom: 0;
        left: 0;
        right: 0;
      }

      .ng-sidebar__content--animate {
        -webkit-transition: -webkit-transform var(--ng-sidebar-transition-duration, 0.3s) cubic-bezier(0, 0, 0.3, 1),
          padding var(--ng-sidebar-transition-duration, 0.3s) cubic-bezier(0, 0, 0.3, 1);
        transition: transform var(--ng-sidebar-transition-duration, 0.3s) cubic-bezier(0, 0, 0.3, 1),
          padding var(--ng-sidebar-transition-duration, 0.3s) cubic-bezier(0, 0, 0.3, 1);
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [CommonModule],
})
export class SidebarContainer implements AfterContentInit, OnDestroy {
  animate = input<boolean>(true);

  allowSidebarBackdropControl = input<boolean>(true);
  showBackdrop = model<boolean>(false);
  onBackdropClicked = output<void>();

  contentClass = input<string>();
  backdropClass = input<string>();

  private _sidebars: Array<Sidebar> = [];
  private _subscriptions: Map<Sidebar, Array<{ unsubscribe: () => void }>> = new Map();

  constructor(private _ref: ChangeDetectorRef) {
    effect(() => {
      // Just a placeholder to ensure effect tracks showBackdrop if needed elsewhere.
      this.showBackdrop();
    });
  }

  ngAfterContentInit(): void {
    this._onToggle();
  }

  ngOnDestroy(): void {
    this._unsubscribe();
  }

  /**
   * @internal
   */
  _addSidebar(sidebar: Sidebar) {
    this._sidebars.push(sidebar);
    this._subscribe(sidebar);
  }

  /**
   * @internal
   */
  _removeSidebar(sidebar: Sidebar) {
    const index = this._sidebars.indexOf(sidebar);
    if (index !== -1) {
      this._sidebars.splice(index, 1);
      this._unsubscribe(sidebar);
    }
  }

  /**
   * @internal
   */
  _getContentStyle(): Record<string, string> {
    let left = 0,
      right = 0,
      top = 0,
      bottom = 0;

    let transformStyle: string = "";
    let heightStyle: string = "";
    let widthStyle: string = "";

    for (const sidebar of this._sidebars) {
      if (sidebar._isModeSlide()) {
        if (sidebar.opened()) {
          const transformDir: string = sidebar._isLeftOrRight() ? "X" : "Y";
          const transformAmt: string = `${sidebar._isLeftOrTop() ? "" : "-"}${
            sidebar._isLeftOrRight() ? sidebar._width : sidebar._height
          }`;

          transformStyle = `translate${transformDir}(${transformAmt}px)`;
        }
      }

      if ((sidebar._isModePush() && sidebar.opened()) || sidebar.dock()) {
        let paddingAmt: number = 0;

        if (sidebar._isModeSlide() && sidebar.opened()) {
          if (sidebar._isLeftOrRight()) {
            widthStyle = "100%";
          } else {
            heightStyle = "100%";
          }
        } else {
          if (sidebar._isDocked() || (sidebar._isModeOver() && sidebar.dock())) {
            paddingAmt = sidebar._dockedSize();
          } else {
            paddingAmt = sidebar._isLeftOrRight()
              ? sidebar._width
              : sidebar._height;
          }
        }

        switch (sidebar._normalizedPosition()) {
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
   */
  _onBackdropClicked(): void {
    let backdropClicked = false;
    for (const sidebar of this._sidebars) {
      if (
        sidebar.opened() &&
        sidebar.showBackdrop() &&
        sidebar.closeOnClickBackdrop()
      ) {
        sidebar.close();
        backdropClicked = true;
      }
    }

    if (backdropClicked) {
      this.onBackdropClicked.emit();
    }
  }

  private _subscribe(sidebar: Sidebar): void {
    const subs: Array<{ unsubscribe: () => void }> = [
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

  private _unsubscribe(sidebar?: Sidebar): void {
    if (sidebar) {
      const subs = this._subscriptions.get(sidebar);
      if (subs) {
        subs.forEach((s) => s.unsubscribe());
        this._subscriptions.delete(sidebar);
      }
    } else {
      this._subscriptions.forEach((subs) =>
        subs.forEach((s) => s.unsubscribe())
      );
      this._subscriptions.clear();
    }
  }

  private _onToggle(): void {
    if (this._sidebars.length > 0 && this.allowSidebarBackdropControl()) {
      const hasOpen = this._sidebars.some(
        (sidebar) => sidebar.opened() && sidebar.showBackdrop()
      );

      this.showBackdrop.set(hasOpen);
    }

    setTimeout(() => {
      this._markForCheck();
    });
  }

  private _markForCheck(): void {
    this._ref.markForCheck();
  }
}
