import { Directive } from "@angular/core";
import * as i0 from "@angular/core";
import * as i1 from "./sidebar.component";
export class CloseSidebar {
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
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.2.14", ngImport: i0, type: CloseSidebar, deps: [{ token: i1.Sidebar }], target: i0.ɵɵFactoryTarget.Directive });
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
        }], ctorParameters: () => [{ type: i1.Sidebar }] });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2xvc2UuZGlyZWN0aXZlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL2Nsb3NlLmRpcmVjdGl2ZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsU0FBUyxFQUFFLE1BQU0sZUFBZSxDQUFDOzs7QUFXMUMsTUFBTSxPQUFPLFlBQVk7SUFDSDtJQUFwQixZQUFvQixRQUFpQjtRQUFqQixhQUFRLEdBQVIsUUFBUSxDQUFTO0lBQUcsQ0FBQztJQUV6QyxnQkFBZ0I7SUFDaEIsUUFBUTtRQUNOLElBQUksSUFBSSxDQUFDLFFBQVEsRUFBRSxDQUFDO1lBQ2xCLElBQUksQ0FBQyxRQUFRLENBQUMsS0FBSyxFQUFFLENBQUM7UUFDeEIsQ0FBQztJQUNILENBQUM7d0dBUlUsWUFBWTs0RkFBWixZQUFZOzs0RkFBWixZQUFZO2tCQVB4QixTQUFTO21CQUFDO29CQUNULFFBQVEsRUFBRSxnQkFBZ0I7b0JBQzFCLElBQUksRUFBRTt3QkFDSixTQUFTLEVBQUUsWUFBWTtxQkFDeEI7b0JBQ0QsVUFBVSxFQUFFLElBQUk7aUJBQ2pCIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgRGlyZWN0aXZlIH0gZnJvbSBcIkBhbmd1bGFyL2NvcmVcIjtcblxuaW1wb3J0IHsgU2lkZWJhciB9IGZyb20gXCIuL3NpZGViYXIuY29tcG9uZW50XCI7XG5cbkBEaXJlY3RpdmUoe1xuICBzZWxlY3RvcjogXCJbY2xvc2VTaWRlYmFyXVwiLFxuICBob3N0OiB7XG4gICAgXCIoY2xpY2spXCI6IFwiX29uQ2xpY2soKVwiLFxuICB9LFxuICBzdGFuZGFsb25lOiB0cnVlLFxufSlcbmV4cG9ydCBjbGFzcyBDbG9zZVNpZGViYXIge1xuICBjb25zdHJ1Y3Rvcihwcml2YXRlIF9zaWRlYmFyOiBTaWRlYmFyKSB7fVxuXG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgX29uQ2xpY2soKTogdm9pZCB7XG4gICAgaWYgKHRoaXMuX3NpZGViYXIpIHtcbiAgICAgIHRoaXMuX3NpZGViYXIuY2xvc2UoKTtcbiAgICB9XG4gIH1cbn1cbiJdfQ==