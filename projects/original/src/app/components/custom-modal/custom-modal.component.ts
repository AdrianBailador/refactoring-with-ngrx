import { ChangeDetectorRef, Component, OnDestroy, OnInit } from "@angular/core";
import { CustomModalService } from "./custom-modal.service";

@Component({
  selector: "app-custom-modal",
  templateUrl: "./custom-modal.component.html"
})
export class CustomModalComponent implements OnInit, OnDestroy {
  public params: any;
  public hidden: boolean;
  private result: Array<string>;

  constructor(
    private customModalService: CustomModalService,
    private cdRef: ChangeDetectorRef
  ) {
    this.customModalService.stateChange.subscribe(params => {
      this.params = params;
      this.result = [];
      this.cdRef.detectChanges();
    });
    this.hidden = true;
  }

  ngOnInit() {}

  ngOnDestroy() {
    this.cdRef.detach();
  }

  changeStatus(item, checked) {
    const idx = this.result.indexOf(item);
    if (checked) {
      if (idx === -1) {
        this.result.push(item);
      }
    } else {
      if (idx !== -1) {
        this.result.splice(idx, 1);
      }
    }
  }

  onCancelClicked() {
    document
      .querySelectorAll(".modal .checkboxes input")
      .forEach(input => ((input as any).checked = false));
    this.customModalService.hide(this.params);
  }

  onOkClicked() {
    this.params.input = Array.isArray(this.params.input)
      ? this.result.slice()
      : this.params.input;
    this.params.confirmed = true;
    this.cdRef.detectChanges();
    document
      .querySelectorAll(".modal .checkboxes input")
      .forEach(input => ((input as any).checked = false));
    this.customModalService.hide(this.params);
  }
}
