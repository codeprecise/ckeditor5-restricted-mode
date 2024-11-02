import { ChangeDetectorRef, Component, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChangeEvent, CKEditorModule } from '@ckeditor/ckeditor5-angular';

import {
	ClassicEditor,
	AccessibilityHelp,
	Autoformat,
	Autosave,
	BlockQuote,
	Bold,
	Essentials,
	FullPage,
	GeneralHtmlSupport,
	Heading,
	HtmlComment,
	HtmlEmbed,
	Indent,
	IndentBlock,
	Italic,
	Link,
	Paragraph,
	SelectAll,
	ShowBlocks,
	SourceEditing,
	Table,
	TableCaption,
	TableCellProperties,
	TableColumnResize,
	TableProperties,
	TableToolbar,
	TextTransformation,
	Underline,
	Undo,
	EditorConfig,
	StandardEditingMode,
	RestrictedEditingMode,
	ToolbarConfigItem,
	ToolbarConfig,
	Writer,
	ListProperties,
	List,
	Editor,
} from 'ckeditor5';
import { FormsModule } from '@angular/forms';

const TABLE: string = `
`
const INITIAL_DATA: string = 
`
<h1>Numbered list</h1>
<ol>
	<li>
		My first name is: 
		<span class="restricted-editing-exception">David</span>
	</li>
	<li>
		My company is: 
		<span class="restricted-editing-exception">CodePrecise</span>
	</li>
</ol>

<h1>Numbered list2</h1>
<ol>
	<li>
		My first name is: David
	</li>
	<li>
		My company is: CodePrecise
	</li>
</ol>

<h1>Inline table</h1>
<figure class="table">
    <table>
        <tbody>
            <tr>
                <td>Foo</td>
                <td>Bar</td>
            </tr>
        </tbody>
    </table>
</figure>

<h1>Block table</h1>
<figure class="table">
    <table>
        <tbody>
            <tr>
                <td>
                    <p>Foo</p>
                    <p>Bar</p>
                </td>
                <td>
                    <h2>Some title</h2>
                </td>
                <td>
                    <p style="text-align: right;">Baz</p>
                </td>
            </tr>
        </tbody>
    </table>
</figure>
`

@Component({
	selector: 'app-root',
	standalone: true,
	imports: [CommonModule, CKEditorModule, FormsModule],
	templateUrl: './app.component.html',
	styleUrls: ['./app.component.css'],
	encapsulation: ViewEncapsulation.None
})
export class AppComponent {
	public isLayoutReady = false;
	public Editor = ClassicEditor;
	public data: string = '';

	public baseConfig: EditorConfig = {};
	public standardConfig: EditorConfig = {};
	public restrictedConfig: EditorConfig = {};

	constructor(private changeDetector: ChangeDetectorRef) {
		// Fixes the collapsed marker issue on init
		// See https://github.com/ckeditor/ckeditor5/issues/9646
		setTimeout(() => this.data = INITIAL_DATA, 0)
	}

	public ngAfterViewInit(): void {
		// CKEditor needs the DOM tree before calculating the configuration.
		this.baseConfig = {
			toolbar: {
				items: [
					'numberedList',
					'undo',
					'redo',
					'|',
					'showBlocks',
					'|',
					'heading',
					'|',
					'bold',
					'italic',
					'underline',
					'|',
					'link',
					'insertTable',
					'blockQuote',
					'htmlEmbed',
					'|',
					'outdent',
					'indent',
				],
				shouldNotGroupWhenFull: false
			},
			plugins: [
				AccessibilityHelp,
				Autoformat,
				Autosave,
				BlockQuote,
				Bold,
				Essentials,
				FullPage,
				GeneralHtmlSupport,
				Heading,
				HtmlComment,
				HtmlEmbed,
				Indent,
				IndentBlock,
				Italic,
				Link,
				Paragraph,
				SelectAll,
				ShowBlocks,
				SourceEditing,
				Table,
				TableCaption,
				TableCellProperties,
				TableColumnResize,
				TableProperties,
				TableToolbar,
				TextTransformation,
				Underline,
				Undo,
				List,
				ListProperties,
			],
			heading: {
				options: [
					{
						model: 'paragraph',
						title: 'Paragraph',
						class: 'ck-heading_paragraph'
					},
					{
						model: 'heading1',
						view: 'h1',
						title: 'Heading 1',
						class: 'ck-heading_heading1'
					},
					{
						model: 'heading2',
						view: 'h2',
						title: 'Heading 2',
						class: 'ck-heading_heading2'
					},
					{
						model: 'heading3',
						view: 'h3',
						title: 'Heading 3',
						class: 'ck-heading_heading3'
					},
					{
						model: 'heading4',
						view: 'h4',
						title: 'Heading 4',
						class: 'ck-heading_heading4'
					},
					{
						model: 'heading5',
						view: 'h5',
						title: 'Heading 5',
						class: 'ck-heading_heading5'
					},
					{
						model: 'heading6',
						view: 'h6',
						title: 'Heading 6',
						class: 'ck-heading_heading6'
					}
				]
			},
			htmlSupport: {
				allow: [
					{
						name: /^.*$/,
						styles: true,
						attributes: true,
						classes: true
					}
				]
			},
			link: {
				addTargetToExternalLinks: true,
				defaultProtocol: 'https://',
				decorators: {
					toggleDownloadable: {
						mode: 'manual',
						label: 'Downloadable',
						attributes: {
							download: 'file'
						}
					}
				}
			},
			placeholder: 'Type or paste your content here!',
			table: {
				contentToolbar: ['tableColumn', 'tableRow', 'mergeTableCells', 'tableProperties', 'tableCellProperties']
			},
			restrictedEditing: {
				allowedCommands: [ 
					'delete',
					'enter',
					'numberedList',
					// 'bulletedList',
					// 'indentList',
					// 'outdentList',
					// 'mergeListItemBackward',
					// 'mergeListItemForward',
					'splitListItemBefore',
					'splitListItemAfter',
					// 'listStyle',
					// 'listStart',
					// 'listReversed',
					// 'todoList',
					// 'checkTodoList',
				],
				allowedAttributes: [ 'bold', 'italic', 'linkHref' ]
			}
		};
		this.standardConfig = {
			...this.baseConfig,
			plugins: [StandardEditingMode, ...this.baseConfig.plugins!],
			toolbar: ['restrictedEditingException', ...this.getToolbarItems(this.baseConfig.toolbar!)]
		};
		this.restrictedConfig = {
			...this.baseConfig,
			plugins: [RestrictedEditingMode, ...this.baseConfig.plugins!],
			toolbar: ['restrictedEditing', ...this.getToolbarItems(this.baseConfig.toolbar!)]
		};
		this.isLayoutReady = true;
		this.changeDetector.detectChanges();
	}

	public onReady(editor: Editor) {
		const plugin = editor.plugins.get( 'RestrictedEditingModeEditing' )	
		plugin.enableCommand( 'delete' );
		plugin.enableCommand( 'enter' );
		plugin.enableCommand( 'numberedList' );
		plugin.enableCommand( 'splitListItemBefore' );
		plugin.enableCommand( 'splitListItemAfter' );
	}

	public onChange({ editor }: ChangeEvent) {
		console.log(editor.commands)
		editor.model.change(writer => this.removeEmptyMarkers(writer));
    }

	// Toolbar can either be:
	// 1. A class with a field 'items: ToolbarConfigItem[]'
	// 2. A ToolbarConfigItem[]
	// This function returns the correct array.
	private getToolbarItems(toolbar: ToolbarConfig): ToolbarConfigItem[] {
		if ('items' in toolbar) {
			return toolbar.items ?? [];
		}
		return toolbar as ToolbarConfigItem[];
	}

	// This solves https://github.com/ckeditor/ckeditor5/issues/9646
	// when using databinding the editor creates empty collapsed blank markers
	private removeEmptyMarkers(writer: Writer): void {
		for (const marker of Array.from(writer.model.markers)) {
			if (marker.getStart().isEqual(marker.getEnd())) {
				writer.removeMarker(marker);
			}
		}
	}
}