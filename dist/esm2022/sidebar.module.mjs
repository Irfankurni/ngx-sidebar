import { NgModule } from "@angular/core";
import { SidebarContainer } from "./sidebar-container.component";
import { Sidebar } from "./sidebar.component";
import { CloseSidebar } from "./close.directive";
import * as i0 from "@angular/core";
export class SidebarModule {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2lkZWJhci5tb2R1bGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvc2lkZWJhci5tb2R1bGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUF1QixRQUFRLEVBQUUsTUFBTSxlQUFlLENBQUM7QUFHOUQsT0FBTyxFQUFFLGdCQUFnQixFQUFFLE1BQU0sK0JBQStCLENBQUM7QUFDakUsT0FBTyxFQUFFLE9BQU8sRUFBRSxNQUFNLHFCQUFxQixDQUFDO0FBQzlDLE9BQU8sRUFBRSxZQUFZLEVBQUUsTUFBTSxtQkFBbUIsQ0FBQzs7QUFNakQsTUFBTSxPQUFPLGFBQWE7SUFDeEIsTUFBTSxDQUFDLE9BQU87UUFDWixPQUFPO1lBQ0wsUUFBUSxFQUFFLGFBQWE7U0FDeEIsQ0FBQztJQUNKLENBQUM7d0dBTFUsYUFBYTt5R0FBYixhQUFhLFlBSGQsZ0JBQWdCLEVBQUUsT0FBTyxFQUFFLFlBQVksYUFDdkMsZ0JBQWdCLEVBQUUsT0FBTyxFQUFFLFlBQVk7eUdBRXRDLGFBQWEsWUFIZCxnQkFBZ0IsRUFBRSxPQUFPOzs0RkFHeEIsYUFBYTtrQkFKekIsUUFBUTttQkFBQztvQkFDUixPQUFPLEVBQUUsQ0FBQyxnQkFBZ0IsRUFBRSxPQUFPLEVBQUUsWUFBWSxDQUFDO29CQUNsRCxPQUFPLEVBQUUsQ0FBQyxnQkFBZ0IsRUFBRSxPQUFPLEVBQUUsWUFBWSxDQUFDO2lCQUNuRCIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IE1vZHVsZVdpdGhQcm92aWRlcnMsIE5nTW9kdWxlIH0gZnJvbSBcIkBhbmd1bGFyL2NvcmVcIjtcbmltcG9ydCB7IENvbW1vbk1vZHVsZSB9IGZyb20gXCJAYW5ndWxhci9jb21tb25cIjtcblxuaW1wb3J0IHsgU2lkZWJhckNvbnRhaW5lciB9IGZyb20gXCIuL3NpZGViYXItY29udGFpbmVyLmNvbXBvbmVudFwiO1xuaW1wb3J0IHsgU2lkZWJhciB9IGZyb20gXCIuL3NpZGViYXIuY29tcG9uZW50XCI7XG5pbXBvcnQgeyBDbG9zZVNpZGViYXIgfSBmcm9tIFwiLi9jbG9zZS5kaXJlY3RpdmVcIjtcblxuQE5nTW9kdWxlKHtcbiAgaW1wb3J0czogW1NpZGViYXJDb250YWluZXIsIFNpZGViYXIsIENsb3NlU2lkZWJhcl0sXG4gIGV4cG9ydHM6IFtTaWRlYmFyQ29udGFpbmVyLCBTaWRlYmFyLCBDbG9zZVNpZGViYXJdLFxufSlcbmV4cG9ydCBjbGFzcyBTaWRlYmFyTW9kdWxlIHtcbiAgc3RhdGljIGZvclJvb3QoKTogTW9kdWxlV2l0aFByb3ZpZGVyczxTaWRlYmFyTW9kdWxlPiB7XG4gICAgcmV0dXJuIHtcbiAgICAgIG5nTW9kdWxlOiBTaWRlYmFyTW9kdWxlLFxuICAgIH07XG4gIH1cbn1cbiJdfQ==