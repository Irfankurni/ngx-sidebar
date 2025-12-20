import { ChangeDetectionStrategy, Component, EventEmitter, Inject, Input, Output, PLATFORM_ID, } from "@angular/core";
import { isPlatformBrowser, CommonModule } from "@angular/common";
import * as i0 from "@angular/core";
import * as i1 from "@angular/common";
// Based on https://github.com/angular/material2/tree/master/src/lib/sidenav
export class SidebarContainer {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2lkZWJhci1jb250YWluZXIuY29tcG9uZW50LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL3NpZGViYXItY29udGFpbmVyLmNvbXBvbmVudC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBRUwsdUJBQXVCLEVBRXZCLFNBQVMsRUFDVCxZQUFZLEVBQ1osTUFBTSxFQUNOLEtBQUssRUFHTCxNQUFNLEVBQ04sV0FBVyxHQUVaLE1BQU0sZUFBZSxDQUFDO0FBQ3ZCLE9BQU8sRUFBRSxpQkFBaUIsRUFBRSxZQUFZLEVBQUUsTUFBTSxpQkFBaUIsQ0FBQzs7O0FBS2xFLDRFQUE0RTtBQW9FNUUsTUFBTSxPQUFPLGdCQUFnQjtJQW1CakI7SUFoQkQsT0FBTyxHQUFZLElBQUksQ0FBQztJQUV4QiwyQkFBMkIsR0FBWSxJQUFJLENBQUM7SUFDNUMsWUFBWSxHQUFZLEtBQUssQ0FBQztJQUM3QixrQkFBa0IsR0FBRyxJQUFJLFlBQVksRUFBVyxDQUFDO0lBQ2pELGlCQUFpQixHQUFHLElBQUksWUFBWSxFQUFRLENBQUM7SUFFOUMsWUFBWSxDQUFVO0lBQ3RCLGFBQWEsQ0FBVTtJQUV4QixTQUFTLEdBQW1CLEVBQUUsQ0FBQztJQUMvQixjQUFjLEdBQWlDLElBQUksR0FBRyxFQUFFLENBQUM7SUFFekQsVUFBVSxDQUFVO0lBRTVCLFlBQ1UsSUFBdUIsRUFDVixVQUFrQjtRQUQvQixTQUFJLEdBQUosSUFBSSxDQUFtQjtRQUcvQixJQUFJLENBQUMsVUFBVSxHQUFHLGlCQUFpQixDQUFDLFVBQVUsQ0FBQyxDQUFDO0lBQ2xELENBQUM7SUFFRCxrQkFBa0I7UUFDaEIsSUFBSSxDQUFDLElBQUksQ0FBQyxVQUFVLEVBQUUsQ0FBQztZQUNyQixPQUFPO1FBQ1QsQ0FBQztRQUVELElBQUksQ0FBQyxTQUFTLEVBQUUsQ0FBQztJQUNuQixDQUFDO0lBRUQsV0FBVyxDQUFDLE9BQXNCO1FBQ2hDLElBQUksQ0FBQyxJQUFJLENBQUMsVUFBVSxFQUFFLENBQUM7WUFDckIsT0FBTztRQUNULENBQUM7UUFFRCxJQUFJLE9BQU8sQ0FBQyxjQUFjLENBQUMsRUFBRSxDQUFDO1lBQzVCLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLGNBQWMsQ0FBQyxDQUFDLFlBQVksQ0FBQyxDQUFDO1FBQ3JFLENBQUM7SUFDSCxDQUFDO0lBRUQsV0FBVztRQUNULElBQUksQ0FBQyxJQUFJLENBQUMsVUFBVSxFQUFFLENBQUM7WUFDckIsT0FBTztRQUNULENBQUM7UUFFRCxJQUFJLENBQUMsWUFBWSxFQUFFLENBQUM7SUFDdEIsQ0FBQztJQUVEOzs7Ozs7T0FNRztJQUNILFdBQVcsQ0FBQyxPQUFnQjtRQUMxQixJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUM3QixJQUFJLENBQUMsVUFBVSxDQUFDLE9BQU8sQ0FBQyxDQUFDO0lBQzNCLENBQUM7SUFFRDs7Ozs7O09BTUc7SUFDSCxjQUFjLENBQUMsT0FBZ0I7UUFDN0IsTUFBTSxLQUFLLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLENBQUM7UUFDOUMsSUFBSSxLQUFLLEtBQUssQ0FBQyxDQUFDLEVBQUUsQ0FBQztZQUNqQixJQUFJLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxLQUFLLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDaEMsSUFBSSxDQUFDLFlBQVksQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUM3QixDQUFDO0lBQ0gsQ0FBQztJQUVEOzs7Ozs7T0FNRztJQUNILGdCQUFnQjtRQUNkLElBQUksSUFBSSxHQUFHLENBQUMsRUFDVixLQUFLLEdBQUcsQ0FBQyxFQUNULEdBQUcsR0FBRyxDQUFDLEVBQ1AsTUFBTSxHQUFHLENBQUMsQ0FBQztRQUViLElBQUksY0FBYyxHQUFXLEVBQUUsQ0FBQztRQUNoQyxJQUFJLFdBQVcsR0FBVyxFQUFFLENBQUM7UUFDN0IsSUFBSSxVQUFVLEdBQVcsRUFBRSxDQUFDO1FBRTVCLEtBQUssTUFBTSxPQUFPLElBQUksSUFBSSxDQUFDLFNBQVMsRUFBRSxDQUFDO1lBQ3JDLHdEQUF3RDtZQUN4RCxJQUFJLE9BQU8sQ0FBQyxZQUFZLEVBQUUsQ0FBQztnQkFDekIsSUFBSSxPQUFPLENBQUMsTUFBTSxFQUFFLENBQUM7b0JBQ25CLE1BQU0sWUFBWSxHQUFXLE9BQU8sQ0FBQyxjQUFjLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDO29CQUNoRSxNQUFNLFlBQVksR0FBVyxHQUFHLE9BQU8sQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUM3RCxPQUFPLENBQUMsY0FBYyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsT0FDcEQsRUFBRSxDQUFDO29CQUVILGNBQWMsR0FBRyxZQUFZLFlBQVksSUFBSSxZQUFZLEtBQUssQ0FBQztnQkFDakUsQ0FBQztZQUNILENBQUM7WUFFRCxpQ0FBaUM7WUFDakMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxXQUFXLElBQUksT0FBTyxDQUFDLE1BQU0sQ0FBQyxJQUFJLE9BQU8sQ0FBQyxJQUFJLEVBQUUsQ0FBQztnQkFDNUQsSUFBSSxVQUFVLEdBQVcsQ0FBQyxDQUFDO2dCQUUzQixJQUFJLE9BQU8sQ0FBQyxZQUFZLElBQUksT0FBTyxDQUFDLE1BQU0sRUFBRSxDQUFDO29CQUMzQyxJQUFJLE9BQU8sQ0FBQyxjQUFjLEVBQUUsQ0FBQzt3QkFDM0IsVUFBVSxHQUFHLE1BQU0sQ0FBQztvQkFDdEIsQ0FBQzt5QkFBTSxDQUFDO3dCQUNOLFdBQVcsR0FBRyxNQUFNLENBQUM7b0JBQ3ZCLENBQUM7Z0JBQ0gsQ0FBQztxQkFBTSxDQUFDO29CQUNOLElBQUksT0FBTyxDQUFDLFNBQVMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxXQUFXLElBQUksT0FBTyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUM7d0JBQy9ELFVBQVUsR0FBRyxPQUFPLENBQUMsV0FBVyxDQUFDO29CQUNuQyxDQUFDO3lCQUFNLENBQUM7d0JBQ04sVUFBVSxHQUFHLE9BQU8sQ0FBQyxjQUFjOzRCQUNqQyxDQUFDLENBQUMsT0FBTyxDQUFDLE1BQU07NEJBQ2hCLENBQUMsQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDO29CQUN0QixDQUFDO2dCQUNILENBQUM7Z0JBRUQsUUFBUSxPQUFPLENBQUMsUUFBUSxFQUFFLENBQUM7b0JBQ3pCLEtBQUssTUFBTTt3QkFDVCxJQUFJLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLEVBQUUsVUFBVSxDQUFDLENBQUM7d0JBQ2xDLE1BQU07b0JBRVIsS0FBSyxPQUFPO3dCQUNWLEtBQUssR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLEtBQUssRUFBRSxVQUFVLENBQUMsQ0FBQzt3QkFDcEMsTUFBTTtvQkFFUixLQUFLLEtBQUs7d0JBQ1IsR0FBRyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxFQUFFLFVBQVUsQ0FBQyxDQUFDO3dCQUNoQyxNQUFNO29CQUVSLEtBQUssUUFBUTt3QkFDWCxNQUFNLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxNQUFNLEVBQUUsVUFBVSxDQUFDLENBQUM7d0JBQ3RDLE1BQU07Z0JBQ1YsQ0FBQztZQUNILENBQUM7UUFDSCxDQUFDO1FBRUQsT0FBTztZQUNMLE9BQU8sRUFBRSxHQUFHLEdBQUcsTUFBTSxLQUFLLE1BQU0sTUFBTSxNQUFNLElBQUksSUFBSTtZQUNwRCxlQUFlLEVBQUUsY0FBYztZQUMvQixTQUFTLEVBQUUsY0FBYztZQUN6QixNQUFNLEVBQUUsV0FBVztZQUNuQixLQUFLLEVBQUUsVUFBVTtTQUNLLENBQUM7SUFDM0IsQ0FBQztJQUVEOzs7OztPQUtHO0lBQ0gsa0JBQWtCO1FBQ2hCLElBQUksZUFBZSxHQUFHLEtBQUssQ0FBQztRQUM1QixLQUFLLE1BQU0sT0FBTyxJQUFJLElBQUksQ0FBQyxTQUFTLEVBQUUsQ0FBQztZQUNyQyxJQUNFLE9BQU8sQ0FBQyxNQUFNO2dCQUNkLE9BQU8sQ0FBQyxZQUFZO2dCQUNwQixPQUFPLENBQUMsb0JBQW9CLEVBQzVCLENBQUM7Z0JBQ0QsT0FBTyxDQUFDLEtBQUssRUFBRSxDQUFDO2dCQUNoQixlQUFlLEdBQUcsSUFBSSxDQUFDO1lBQ3pCLENBQUM7UUFDSCxDQUFDO1FBRUQsSUFBSSxlQUFlLEVBQUUsQ0FBQztZQUNwQixJQUFJLENBQUMsaUJBQWlCLENBQUMsSUFBSSxFQUFFLENBQUM7UUFDaEMsQ0FBQztJQUNILENBQUM7SUFFRDs7T0FFRztJQUNLLFVBQVUsQ0FBQyxPQUFnQjtRQUNqQyxNQUFNLElBQUksR0FBbUI7WUFDM0IsT0FBTyxDQUFDLFdBQVcsQ0FBQyxTQUFTLENBQUMsR0FBRyxFQUFFLENBQUMsSUFBSSxDQUFDLFNBQVMsRUFBRSxDQUFDO1lBQ3JELE9BQU8sQ0FBQyxRQUFRLENBQUMsU0FBUyxDQUFDLEdBQUcsRUFBRSxDQUFDLElBQUksQ0FBQyxhQUFhLEVBQUUsQ0FBQztZQUN0RCxPQUFPLENBQUMsWUFBWSxDQUFDLFNBQVMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxJQUFJLENBQUMsU0FBUyxFQUFFLENBQUM7WUFDdEQsT0FBTyxDQUFDLFFBQVEsQ0FBQyxTQUFTLENBQUMsR0FBRyxFQUFFLENBQUMsSUFBSSxDQUFDLGFBQWEsRUFBRSxDQUFDO1lBQ3RELE9BQU8sQ0FBQyxZQUFZLENBQUMsU0FBUyxDQUFDLEdBQUcsRUFBRSxDQUFDLElBQUksQ0FBQyxhQUFhLEVBQUUsQ0FBQztZQUMxRCxPQUFPLENBQUMsZ0JBQWdCLENBQUMsU0FBUyxDQUFDLEdBQUcsRUFBRSxDQUFDLElBQUksQ0FBQyxhQUFhLEVBQUUsQ0FBQztZQUM5RCxPQUFPLENBQUMsV0FBVyxDQUFDLFNBQVMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxJQUFJLENBQUMsYUFBYSxFQUFFLENBQUM7U0FDMUQsQ0FBQztRQUVGLElBQUksQ0FBQyxjQUFjLENBQUMsR0FBRyxDQUFDLE9BQU8sRUFBRSxJQUFJLENBQUMsQ0FBQztJQUN6QyxDQUFDO0lBRUQ7O09BRUc7SUFDSyxZQUFZLENBQUMsT0FBaUI7UUFDcEMsSUFBSSxPQUFPLEVBQUUsQ0FBQztZQUNaLE1BQU0sSUFBSSxHQUFHLElBQUksQ0FBQyxjQUFjLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxDQUFDO1lBQzlDLElBQUksSUFBSSxFQUFFLENBQUM7Z0JBQ1QsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLFdBQVcsRUFBRSxDQUFDLENBQUM7Z0JBQ3JDLElBQUksQ0FBQyxjQUFjLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1lBQ3RDLENBQUM7UUFDSCxDQUFDO2FBQU0sQ0FBQztZQUNOLElBQUksQ0FBQyxjQUFjLENBQUMsT0FBTyxDQUFDLENBQUMsSUFBSSxFQUFFLEVBQUUsQ0FDbkMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLFdBQVcsRUFBRSxDQUFDLENBQ3JDLENBQUM7WUFDRixJQUFJLENBQUMsY0FBYyxDQUFDLEtBQUssRUFBRSxDQUFDO1FBQzlCLENBQUM7SUFDSCxDQUFDO0lBRUQ7O09BRUc7SUFDSyxTQUFTO1FBQ2YsSUFBSSxJQUFJLENBQUMsU0FBUyxDQUFDLE1BQU0sR0FBRyxDQUFDLElBQUksSUFBSSxDQUFDLDJCQUEyQixFQUFFLENBQUM7WUFDbEUsb0RBQW9EO1lBQ3BELE1BQU0sT0FBTyxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUNqQyxDQUFDLE9BQU8sRUFBRSxFQUFFLENBQUMsT0FBTyxDQUFDLE1BQU0sSUFBSSxPQUFPLENBQUMsWUFBWSxDQUNwRCxDQUFDO1lBRUYsSUFBSSxDQUFDLFlBQVksR0FBRyxPQUFPLENBQUM7WUFDNUIsSUFBSSxDQUFDLGtCQUFrQixDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUN4QyxDQUFDO1FBRUQsVUFBVSxDQUFDLEdBQUcsRUFBRTtZQUNkLElBQUksQ0FBQyxhQUFhLEVBQUUsQ0FBQztRQUN2QixDQUFDLENBQUMsQ0FBQztJQUNMLENBQUM7SUFFRDs7T0FFRztJQUNLLGFBQWE7UUFDbkIsSUFBSSxDQUFDLElBQUksQ0FBQyxZQUFZLEVBQUUsQ0FBQztJQUMzQixDQUFDO3dHQWhQVSxnQkFBZ0IsbURBb0JqQixXQUFXOzRGQXBCVixnQkFBZ0IsNFhBakVqQjs7Ozs7Ozs7Ozs7Ozs7Ozs7OztHQW1CVCwwa0JBNENTLFlBQVk7OzRGQUVYLGdCQUFnQjtrQkFuRTVCLFNBQVM7K0JBQ0Usc0JBQXNCLFlBQ3RCOzs7Ozs7Ozs7Ozs7Ozs7Ozs7O0dBbUJULG1CQTBDZ0IsdUJBQXVCLENBQUMsTUFBTSxjQUNuQyxJQUFJLFdBQ1AsQ0FBQyxZQUFZLENBQUM7OzBCQXNCcEIsTUFBTTsyQkFBQyxXQUFXO3lDQWpCWixPQUFPO3NCQUFmLEtBQUs7Z0JBRUcsMkJBQTJCO3NCQUFuQyxLQUFLO2dCQUNHLFlBQVk7c0JBQXBCLEtBQUs7Z0JBQ0ksa0JBQWtCO3NCQUEzQixNQUFNO2dCQUNHLGlCQUFpQjtzQkFBMUIsTUFBTTtnQkFFRSxZQUFZO3NCQUFwQixLQUFLO2dCQUNHLGFBQWE7c0JBQXJCLEtBQUsiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge1xuICBBZnRlckNvbnRlbnRJbml0LFxuICBDaGFuZ2VEZXRlY3Rpb25TdHJhdGVneSxcbiAgQ2hhbmdlRGV0ZWN0b3JSZWYsXG4gIENvbXBvbmVudCxcbiAgRXZlbnRFbWl0dGVyLFxuICBJbmplY3QsXG4gIElucHV0LFxuICBPbkNoYW5nZXMsXG4gIE9uRGVzdHJveSxcbiAgT3V0cHV0LFxuICBQTEFURk9STV9JRCxcbiAgU2ltcGxlQ2hhbmdlcyxcbn0gZnJvbSBcIkBhbmd1bGFyL2NvcmVcIjtcbmltcG9ydCB7IGlzUGxhdGZvcm1Ccm93c2VyLCBDb21tb25Nb2R1bGUgfSBmcm9tIFwiQGFuZ3VsYXIvY29tbW9uXCI7XG5pbXBvcnQgeyBTdWJzY3JpcHRpb24gfSBmcm9tIFwicnhqc1wiO1xuXG5pbXBvcnQgeyBTaWRlYmFyIH0gZnJvbSBcIi4vc2lkZWJhci5jb21wb25lbnRcIjtcblxuLy8gQmFzZWQgb24gaHR0cHM6Ly9naXRodWIuY29tL2FuZ3VsYXIvbWF0ZXJpYWwyL3RyZWUvbWFzdGVyL3NyYy9saWIvc2lkZW5hdlxuQENvbXBvbmVudCh7XG4gIHNlbGVjdG9yOiBcIm5nLXNpZGViYXItY29udGFpbmVyXCIsXG4gIHRlbXBsYXRlOiBgXG4gICAgPGRpdlxuICAgICAgKm5nSWY9XCJzaG93QmFja2Ryb3BcIlxuICAgICAgYXJpYS1oaWRkZW49XCJ0cnVlXCJcbiAgICAgIGNsYXNzPVwibmctc2lkZWJhcl9fYmFja2Ryb3BcIlxuICAgICAgW25nQ2xhc3NdPVwiYmFja2Ryb3BDbGFzc1wiXG4gICAgICAoY2xpY2spPVwiX29uQmFja2Ryb3BDbGlja2VkKClcIlxuICAgID48L2Rpdj5cblxuICAgIDxuZy1jb250ZW50IHNlbGVjdD1cIm5nLXNpZGViYXIsW25nLXNpZGViYXJdXCI+PC9uZy1jb250ZW50PlxuXG4gICAgPGRpdlxuICAgICAgY2xhc3M9XCJuZy1zaWRlYmFyX19jb250ZW50XCJcbiAgICAgIFtjbGFzcy5uZy1zaWRlYmFyX19jb250ZW50LS1hbmltYXRlXT1cImFuaW1hdGVcIlxuICAgICAgW25nQ2xhc3NdPVwiY29udGVudENsYXNzXCJcbiAgICAgIFtuZ1N0eWxlXT1cIl9nZXRDb250ZW50U3R5bGUoKVwiXG4gICAgPlxuICAgICAgPG5nLWNvbnRlbnQgc2VsZWN0PVwiW25nLXNpZGViYXItY29udGVudF1cIj48L25nLWNvbnRlbnQ+XG4gICAgPC9kaXY+XG4gIGAsXG4gIHN0eWxlczogW1xuICAgIGBcbiAgICAgIDpob3N0IHtcbiAgICAgICAgYm94LXNpemluZzogYm9yZGVyLWJveDtcbiAgICAgICAgZGlzcGxheTogYmxvY2s7XG4gICAgICAgIHBvc2l0aW9uOiByZWxhdGl2ZTtcbiAgICAgICAgaGVpZ2h0OiAxMDAlO1xuICAgICAgICB3aWR0aDogMTAwJTtcbiAgICAgICAgb3ZlcmZsb3c6IGhpZGRlbjtcbiAgICAgIH1cblxuICAgICAgLm5nLXNpZGViYXJfX2JhY2tkcm9wIHtcbiAgICAgICAgcG9zaXRpb246IGFic29sdXRlO1xuICAgICAgICB0b3A6IDA7XG4gICAgICAgIGJvdHRvbTogMDtcbiAgICAgICAgbGVmdDogMDtcbiAgICAgICAgcmlnaHQ6IDA7XG4gICAgICAgIGJhY2tncm91bmQ6ICMwMDA7XG4gICAgICAgIG9wYWNpdHk6IDAuNzU7XG4gICAgICAgIHBvaW50ZXItZXZlbnRzOiBhdXRvO1xuICAgICAgICB6LWluZGV4OiAxO1xuICAgICAgfVxuXG4gICAgICAubmctc2lkZWJhcl9fY29udGVudCB7XG4gICAgICAgIC13ZWJraXQtb3ZlcmZsb3ctc2Nyb2xsaW5nOiB0b3VjaDtcbiAgICAgICAgb3ZlcmZsb3c6IGF1dG87XG4gICAgICAgIHBvc2l0aW9uOiBhYnNvbHV0ZTtcbiAgICAgICAgdG9wOiAwO1xuICAgICAgICBib3R0b206IDA7XG4gICAgICAgIGxlZnQ6IDA7XG4gICAgICAgIHJpZ2h0OiAwO1xuICAgICAgfVxuXG4gICAgICAubmctc2lkZWJhcl9fY29udGVudC0tYW5pbWF0ZSB7XG4gICAgICAgIC13ZWJraXQtdHJhbnNpdGlvbjogLXdlYmtpdC10cmFuc2Zvcm0gMC4zcyBjdWJpYy1iZXppZXIoMCwgMCwgMC4zLCAxKSxcbiAgICAgICAgICBwYWRkaW5nIDAuM3MgY3ViaWMtYmV6aWVyKDAsIDAsIDAuMywgMSk7XG4gICAgICAgIHRyYW5zaXRpb246IHRyYW5zZm9ybSAwLjNzIGN1YmljLWJlemllcigwLCAwLCAwLjMsIDEpLFxuICAgICAgICAgIHBhZGRpbmcgMC4zcyBjdWJpYy1iZXppZXIoMCwgMCwgMC4zLCAxKTtcbiAgICAgIH1cbiAgICBgLFxuICBdLFxuICBjaGFuZ2VEZXRlY3Rpb246IENoYW5nZURldGVjdGlvblN0cmF0ZWd5Lk9uUHVzaCxcbiAgc3RhbmRhbG9uZTogdHJ1ZSxcbiAgaW1wb3J0czogW0NvbW1vbk1vZHVsZV0sXG59KVxuZXhwb3J0IGNsYXNzIFNpZGViYXJDb250YWluZXJcbiAgaW1wbGVtZW50cyBBZnRlckNvbnRlbnRJbml0LCBPbkNoYW5nZXMsIE9uRGVzdHJveVxue1xuICBASW5wdXQoKSBhbmltYXRlOiBib29sZWFuID0gdHJ1ZTtcblxuICBASW5wdXQoKSBhbGxvd1NpZGViYXJCYWNrZHJvcENvbnRyb2w6IGJvb2xlYW4gPSB0cnVlO1xuICBASW5wdXQoKSBzaG93QmFja2Ryb3A6IGJvb2xlYW4gPSBmYWxzZTtcbiAgQE91dHB1dCgpIHNob3dCYWNrZHJvcENoYW5nZSA9IG5ldyBFdmVudEVtaXR0ZXI8Ym9vbGVhbj4oKTtcbiAgQE91dHB1dCgpIG9uQmFja2Ryb3BDbGlja2VkID0gbmV3IEV2ZW50RW1pdHRlcjxudWxsPigpO1xuXG4gIEBJbnB1dCgpIGNvbnRlbnRDbGFzcz86IHN0cmluZztcbiAgQElucHV0KCkgYmFja2Ryb3BDbGFzcz86IHN0cmluZztcblxuICBwcml2YXRlIF9zaWRlYmFyczogQXJyYXk8U2lkZWJhcj4gPSBbXTtcbiAgcHJpdmF0ZSBfc3Vic2NyaXB0aW9uczogTWFwPFNpZGViYXIsIFN1YnNjcmlwdGlvbltdPiA9IG5ldyBNYXAoKTtcblxuICBwcml2YXRlIF9pc0Jyb3dzZXI6IGJvb2xlYW47XG5cbiAgY29uc3RydWN0b3IoXG4gICAgcHJpdmF0ZSBfcmVmOiBDaGFuZ2VEZXRlY3RvclJlZixcbiAgICBASW5qZWN0KFBMQVRGT1JNX0lEKSBwbGF0Zm9ybUlkOiBPYmplY3RcbiAgKSB7XG4gICAgdGhpcy5faXNCcm93c2VyID0gaXNQbGF0Zm9ybUJyb3dzZXIocGxhdGZvcm1JZCk7XG4gIH1cblxuICBuZ0FmdGVyQ29udGVudEluaXQoKTogdm9pZCB7XG4gICAgaWYgKCF0aGlzLl9pc0Jyb3dzZXIpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB0aGlzLl9vblRvZ2dsZSgpO1xuICB9XG5cbiAgbmdPbkNoYW5nZXMoY2hhbmdlczogU2ltcGxlQ2hhbmdlcyk6IHZvaWQge1xuICAgIGlmICghdGhpcy5faXNCcm93c2VyKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgaWYgKGNoYW5nZXNbXCJzaG93QmFja2Ryb3BcIl0pIHtcbiAgICAgIHRoaXMuc2hvd0JhY2tkcm9wQ2hhbmdlLmVtaXQoY2hhbmdlc1tcInNob3dCYWNrZHJvcFwiXS5jdXJyZW50VmFsdWUpO1xuICAgIH1cbiAgfVxuXG4gIG5nT25EZXN0cm95KCk6IHZvaWQge1xuICAgIGlmICghdGhpcy5faXNCcm93c2VyKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdGhpcy5fdW5zdWJzY3JpYmUoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBAaW50ZXJuYWxcbiAgICpcbiAgICogQWRkcyBhIHNpZGViYXIgdG8gdGhlIGNvbnRhaW5lcidzIGxpc3Qgb2Ygc2lkZWJhcnMuXG4gICAqXG4gICAqIEBwYXJhbSBzaWRlYmFyIHtTaWRlYmFyfSBBIHNpZGViYXIgd2l0aGluIHRoZSBjb250YWluZXIgdG8gcmVnaXN0ZXIuXG4gICAqL1xuICBfYWRkU2lkZWJhcihzaWRlYmFyOiBTaWRlYmFyKSB7XG4gICAgdGhpcy5fc2lkZWJhcnMucHVzaChzaWRlYmFyKTtcbiAgICB0aGlzLl9zdWJzY3JpYmUoc2lkZWJhcik7XG4gIH1cblxuICAvKipcbiAgICogQGludGVybmFsXG4gICAqXG4gICAqIFJlbW92ZXMgYSBzaWRlYmFyIGZyb20gdGhlIGNvbnRhaW5lcidzIGxpc3Qgb2Ygc2lkZWJhcnMuXG4gICAqXG4gICAqIEBwYXJhbSBzaWRlYmFyIHtTaWRlYmFyfSBUaGUgc2lkZWJhciB0byByZW1vdmUuXG4gICAqL1xuICBfcmVtb3ZlU2lkZWJhcihzaWRlYmFyOiBTaWRlYmFyKSB7XG4gICAgY29uc3QgaW5kZXggPSB0aGlzLl9zaWRlYmFycy5pbmRleE9mKHNpZGViYXIpO1xuICAgIGlmIChpbmRleCAhPT0gLTEpIHtcbiAgICAgIHRoaXMuX3NpZGViYXJzLnNwbGljZShpbmRleCwgMSk7XG4gICAgICB0aGlzLl91bnN1YnNjcmliZShzaWRlYmFyKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogQGludGVybmFsXG4gICAqXG4gICAqIENvbXB1dGVzIGBtYXJnaW5gIHZhbHVlIHRvIHB1c2ggcGFnZSBjb250ZW50cyB0byBhY2NvbW1vZGF0ZSBvcGVuIHNpZGViYXJzIGFzIG5lZWRlZC5cbiAgICpcbiAgICogQHJldHVybiB7Q1NTU3R5bGVEZWNsYXJhdGlvbn0gbWFyZ2luIHN0eWxlcyBmb3IgdGhlIHBhZ2UgY29udGVudC5cbiAgICovXG4gIF9nZXRDb250ZW50U3R5bGUoKTogQ1NTU3R5bGVEZWNsYXJhdGlvbiB7XG4gICAgbGV0IGxlZnQgPSAwLFxuICAgICAgcmlnaHQgPSAwLFxuICAgICAgdG9wID0gMCxcbiAgICAgIGJvdHRvbSA9IDA7XG5cbiAgICBsZXQgdHJhbnNmb3JtU3R5bGU6IHN0cmluZyA9IFwiXCI7XG4gICAgbGV0IGhlaWdodFN0eWxlOiBzdHJpbmcgPSBcIlwiO1xuICAgIGxldCB3aWR0aFN0eWxlOiBzdHJpbmcgPSBcIlwiO1xuXG4gICAgZm9yIChjb25zdCBzaWRlYmFyIG9mIHRoaXMuX3NpZGViYXJzKSB7XG4gICAgICAvLyBTbGlkZSBtb2RlOiB3ZSBuZWVkIHRvIHRyYW5zbGF0ZSB0aGUgZW50aXJlIGNvbnRhaW5lclxuICAgICAgaWYgKHNpZGViYXIuX2lzTW9kZVNsaWRlKSB7XG4gICAgICAgIGlmIChzaWRlYmFyLm9wZW5lZCkge1xuICAgICAgICAgIGNvbnN0IHRyYW5zZm9ybURpcjogc3RyaW5nID0gc2lkZWJhci5faXNMZWZ0T3JSaWdodCA/IFwiWFwiIDogXCJZXCI7XG4gICAgICAgICAgY29uc3QgdHJhbnNmb3JtQW10OiBzdHJpbmcgPSBgJHtzaWRlYmFyLl9pc0xlZnRPclRvcCA/IFwiXCIgOiBcIi1cIn0ke1xuICAgICAgICAgICAgc2lkZWJhci5faXNMZWZ0T3JSaWdodCA/IHNpZGViYXIuX3dpZHRoIDogc2lkZWJhci5faGVpZ2h0XG4gICAgICAgICAgfWA7XG5cbiAgICAgICAgICB0cmFuc2Zvcm1TdHlsZSA9IGB0cmFuc2xhdGUke3RyYW5zZm9ybURpcn0oJHt0cmFuc2Zvcm1BbXR9cHgpYDtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICAvLyBDcmVhdGUgYSBzcGFjZSBmb3IgdGhlIHNpZGViYXJcbiAgICAgIGlmICgoc2lkZWJhci5faXNNb2RlUHVzaCAmJiBzaWRlYmFyLm9wZW5lZCkgfHwgc2lkZWJhci5kb2NrKSB7XG4gICAgICAgIGxldCBwYWRkaW5nQW10OiBudW1iZXIgPSAwO1xuXG4gICAgICAgIGlmIChzaWRlYmFyLl9pc01vZGVTbGlkZSAmJiBzaWRlYmFyLm9wZW5lZCkge1xuICAgICAgICAgIGlmIChzaWRlYmFyLl9pc0xlZnRPclJpZ2h0KSB7XG4gICAgICAgICAgICB3aWR0aFN0eWxlID0gXCIxMDAlXCI7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGhlaWdodFN0eWxlID0gXCIxMDAlXCI7XG4gICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGlmIChzaWRlYmFyLl9pc0RvY2tlZCB8fCAoc2lkZWJhci5faXNNb2RlT3ZlciAmJiBzaWRlYmFyLmRvY2spKSB7XG4gICAgICAgICAgICBwYWRkaW5nQW10ID0gc2lkZWJhci5fZG9ja2VkU2l6ZTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcGFkZGluZ0FtdCA9IHNpZGViYXIuX2lzTGVmdE9yUmlnaHRcbiAgICAgICAgICAgICAgPyBzaWRlYmFyLl93aWR0aFxuICAgICAgICAgICAgICA6IHNpZGViYXIuX2hlaWdodDtcbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBzd2l0Y2ggKHNpZGViYXIucG9zaXRpb24pIHtcbiAgICAgICAgICBjYXNlIFwibGVmdFwiOlxuICAgICAgICAgICAgbGVmdCA9IE1hdGgubWF4KGxlZnQsIHBhZGRpbmdBbXQpO1xuICAgICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgICBjYXNlIFwicmlnaHRcIjpcbiAgICAgICAgICAgIHJpZ2h0ID0gTWF0aC5tYXgocmlnaHQsIHBhZGRpbmdBbXQpO1xuICAgICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgICBjYXNlIFwidG9wXCI6XG4gICAgICAgICAgICB0b3AgPSBNYXRoLm1heCh0b3AsIHBhZGRpbmdBbXQpO1xuICAgICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgICBjYXNlIFwiYm90dG9tXCI6XG4gICAgICAgICAgICBib3R0b20gPSBNYXRoLm1heChib3R0b20sIHBhZGRpbmdBbXQpO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4ge1xuICAgICAgcGFkZGluZzogYCR7dG9wfXB4ICR7cmlnaHR9cHggJHtib3R0b219cHggJHtsZWZ0fXB4YCxcbiAgICAgIHdlYmtpdFRyYW5zZm9ybTogdHJhbnNmb3JtU3R5bGUsXG4gICAgICB0cmFuc2Zvcm06IHRyYW5zZm9ybVN0eWxlLFxuICAgICAgaGVpZ2h0OiBoZWlnaHRTdHlsZSxcbiAgICAgIHdpZHRoOiB3aWR0aFN0eWxlLFxuICAgIH0gYXMgQ1NTU3R5bGVEZWNsYXJhdGlvbjtcbiAgfVxuXG4gIC8qKlxuICAgKiBAaW50ZXJuYWxcbiAgICpcbiAgICogQ2xvc2VzIHNpZGViYXJzIHdoZW4gdGhlIGJhY2tkcm9wIGlzIGNsaWNrZWQsIGlmIHRoZXkgaGF2ZSB0aGVcbiAgICogYGNsb3NlT25DbGlja0JhY2tkcm9wYCBvcHRpb24gc2V0LlxuICAgKi9cbiAgX29uQmFja2Ryb3BDbGlja2VkKCk6IHZvaWQge1xuICAgIGxldCBiYWNrZHJvcENsaWNrZWQgPSBmYWxzZTtcbiAgICBmb3IgKGNvbnN0IHNpZGViYXIgb2YgdGhpcy5fc2lkZWJhcnMpIHtcbiAgICAgIGlmIChcbiAgICAgICAgc2lkZWJhci5vcGVuZWQgJiZcbiAgICAgICAgc2lkZWJhci5zaG93QmFja2Ryb3AgJiZcbiAgICAgICAgc2lkZWJhci5jbG9zZU9uQ2xpY2tCYWNrZHJvcFxuICAgICAgKSB7XG4gICAgICAgIHNpZGViYXIuY2xvc2UoKTtcbiAgICAgICAgYmFja2Ryb3BDbGlja2VkID0gdHJ1ZTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAoYmFja2Ryb3BDbGlja2VkKSB7XG4gICAgICB0aGlzLm9uQmFja2Ryb3BDbGlja2VkLmVtaXQoKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogU3Vic2NyaWJlcyBmcm9tIGEgc2lkZWJhciBldmVudHMgdG8gcmVhY3QgcHJvcGVybHkuXG4gICAqL1xuICBwcml2YXRlIF9zdWJzY3JpYmUoc2lkZWJhcjogU2lkZWJhcik6IHZvaWQge1xuICAgIGNvbnN0IHN1YnM6IFN1YnNjcmlwdGlvbltdID0gW1xuICAgICAgc2lkZWJhci5vbk9wZW5TdGFydC5zdWJzY3JpYmUoKCkgPT4gdGhpcy5fb25Ub2dnbGUoKSksXG4gICAgICBzaWRlYmFyLm9uT3BlbmVkLnN1YnNjcmliZSgoKSA9PiB0aGlzLl9tYXJrRm9yQ2hlY2soKSksXG4gICAgICBzaWRlYmFyLm9uQ2xvc2VTdGFydC5zdWJzY3JpYmUoKCkgPT4gdGhpcy5fb25Ub2dnbGUoKSksXG4gICAgICBzaWRlYmFyLm9uQ2xvc2VkLnN1YnNjcmliZSgoKSA9PiB0aGlzLl9tYXJrRm9yQ2hlY2soKSksXG4gICAgICBzaWRlYmFyLm9uTW9kZUNoYW5nZS5zdWJzY3JpYmUoKCkgPT4gdGhpcy5fbWFya0ZvckNoZWNrKCkpLFxuICAgICAgc2lkZWJhci5vblBvc2l0aW9uQ2hhbmdlLnN1YnNjcmliZSgoKSA9PiB0aGlzLl9tYXJrRm9yQ2hlY2soKSksXG4gICAgICBzaWRlYmFyLl9vblJlcmVuZGVyLnN1YnNjcmliZSgoKSA9PiB0aGlzLl9tYXJrRm9yQ2hlY2soKSksXG4gICAgXTtcblxuICAgIHRoaXMuX3N1YnNjcmlwdGlvbnMuc2V0KHNpZGViYXIsIHN1YnMpO1xuICB9XG5cbiAgLyoqXG4gICAqIFVuc3Vic2NyaWJlcyBmcm9tIGFsbCBzaWRlYmFycy5cbiAgICovXG4gIHByaXZhdGUgX3Vuc3Vic2NyaWJlKHNpZGViYXI/OiBTaWRlYmFyKTogdm9pZCB7XG4gICAgaWYgKHNpZGViYXIpIHtcbiAgICAgIGNvbnN0IHN1YnMgPSB0aGlzLl9zdWJzY3JpcHRpb25zLmdldChzaWRlYmFyKTtcbiAgICAgIGlmIChzdWJzKSB7XG4gICAgICAgIHN1YnMuZm9yRWFjaCgocykgPT4gcy51bnN1YnNjcmliZSgpKTtcbiAgICAgICAgdGhpcy5fc3Vic2NyaXB0aW9ucy5kZWxldGUoc2lkZWJhcik7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuX3N1YnNjcmlwdGlvbnMuZm9yRWFjaCgoc3VicykgPT5cbiAgICAgICAgc3Vicy5mb3JFYWNoKChzKSA9PiBzLnVuc3Vic2NyaWJlKCkpXG4gICAgICApO1xuICAgICAgdGhpcy5fc3Vic2NyaXB0aW9ucy5jbGVhcigpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBDaGVjayBpZiB3ZSBzaG91bGQgc2hvdyB0aGUgYmFja2Ryb3Agd2hlbiBhIHNpZGViYXIgaXMgdG9nZ2xlZC5cbiAgICovXG4gIHByaXZhdGUgX29uVG9nZ2xlKCk6IHZvaWQge1xuICAgIGlmICh0aGlzLl9zaWRlYmFycy5sZW5ndGggPiAwICYmIHRoaXMuYWxsb3dTaWRlYmFyQmFja2Ryb3BDb250cm9sKSB7XG4gICAgICAvLyBTaG93IGJhY2tkcm9wIGlmIGEgc2luZ2xlIG9wZW4gc2lkZWJhciBoYXMgaXQgc2V0XG4gICAgICBjb25zdCBoYXNPcGVuID0gdGhpcy5fc2lkZWJhcnMuc29tZShcbiAgICAgICAgKHNpZGViYXIpID0+IHNpZGViYXIub3BlbmVkICYmIHNpZGViYXIuc2hvd0JhY2tkcm9wXG4gICAgICApO1xuXG4gICAgICB0aGlzLnNob3dCYWNrZHJvcCA9IGhhc09wZW47XG4gICAgICB0aGlzLnNob3dCYWNrZHJvcENoYW5nZS5lbWl0KGhhc09wZW4pO1xuICAgIH1cblxuICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgdGhpcy5fbWFya0ZvckNoZWNrKCk7XG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogVHJpZ2dlcnMgY2hhbmdlIGRldGVjdGlvbiB0byByZWNvbXB1dGUgc3R5bGVzLlxuICAgKi9cbiAgcHJpdmF0ZSBfbWFya0ZvckNoZWNrKCk6IHZvaWQge1xuICAgIHRoaXMuX3JlZi5tYXJrRm9yQ2hlY2soKTtcbiAgfVxufVxuIl19