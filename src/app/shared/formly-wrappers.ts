import { Component } from '@angular/core';
import { FieldWrapper } from '@ngx-formly/core';


@Component({
  selector: 'formly-wrapper-card',
  template: `
    <div class="card">
      <h3 class="card-header"></h3>
      <h3 class="card-header">{{ props.label }}</h3>
      <div class="card-body">
        <ng-container #fieldComponent />
      </div>
    </div>
  `,
})
export class FormlyWrapperCard extends FieldWrapper {}

@Component({
  selector: 'formly-wrapper-div',
  template: `
    <div>
      <ng-container #fieldComponent />
    </div>
  `,
})
export class FormlyWrapperDiv extends FieldWrapper {}
