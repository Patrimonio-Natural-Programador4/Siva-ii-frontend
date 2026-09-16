import { Component } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { AngularEditorConfig, AngularEditorModule } from '@kolkov/angular-editor';
import { FieldType, FieldTypeConfig } from '@ngx-formly/core';


@Component({
  selector: 'formly-field-date',
  template: `
    <mat-form-field appearance="fill" style="width: 100%">
      <mat-label>{{ props.label }}</mat-label>
      <input
        matInput
        [matDatepicker]="picker"
        [formControl]="formControl"
        [required]="!!props.required"
        (click)="picker.open()"
      />
      <mat-datepicker-toggle matSuffix [for]="picker"></mat-datepicker-toggle>
      <mat-datepicker #picker></mat-datepicker>
    </mat-form-field>
  `,
  imports: [ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatDatepickerModule],
})
export class FormlyFieldDate extends FieldType<FieldTypeConfig> {}

@Component({
  selector: 'formly-field-wysiwyg',
  template: `
    <label class="wysiwyg-label">{{ props.label }}{{ props.required ? ' *' : '' }}</label>
    <angular-editor [formControl]="formControl" [config]="editorConfig"></angular-editor>
  `,
  styles: [
    `
      .wysiwyg-label {
        display: block;
        margin-bottom: 4px;
        font-size: 13px;
        color: rgba(0, 0, 0, 0.6);
      }
    `,
  ],
  imports: [ReactiveFormsModule, AngularEditorModule],
})
export class FormlyFieldWysiwyg extends FieldType<FieldTypeConfig> {
  get editorConfig(): AngularEditorConfig {
    return {
      editable: !this.props.disabled,
      minHeight: '120px',
      placeholder: this.props.placeholder ?? '',
      // Keep only: undo, redo, bold, italic, underline, justify*, ordered/unordered list.
      toolbarHiddenButtons: [
        ['strikeThrough', 'subscript', 'superscript'],
        ['heading', 'fontName', 'fontSize', 'textColor', 'backgroundColor', 'customClasses'],
        ['indent', 'outdent', 'removeFormat'],
        ['insertHorizontalRule', 'insertImage', 'insertVideo'],
        ['link', 'unlink'],
        ['toggleEditorMode'],
      ],
    };
  }
}
