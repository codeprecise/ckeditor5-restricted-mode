import { Enter, EnterCommandAfterExecuteEvent, Plugin, RestrictedEditingMode, ViewDocumentEnterEvent, ShiftEnter } from 'ckeditor5';
import { AddSuffixParams, Suffix, RemoveSuffixParams } from './suffix';

// This plugin makes enter/shift enter at the end of a restricted editing area,
// extend the restricted editing area to the next line.
//
// This is done by performing the following actions when enter/shift enter is triggered:
// 1. Adding temporary text after the editor's position
// 2. Moving the editor's position to be before the temporary text
// 3. Allowing the enter/shift enter behavior to happen - 
//    (break a line and create a restricted editing area because the editor's position is in the middle of an area)
// 4. Remove the temporary text
export class RestrictedEditingEnter extends Plugin {

    public static readonly temporarySuffix = " ";

    public static get pluginName() {
		return 'RestrictedEditingEnter' as const;
	}

    public static get requires() {
		return [ Enter, ShiftEnter, RestrictedEditingMode, Suffix ] as const;
	}

	public init(): void {
		const editor = this.editor;
		const view = editor.editing.view;
		const viewDocument = view.document;

        // The suffix must be added before the enter command, so that a restricted editing area will be created.
        // The enter command's (and shift enter command) enter event is listened with a 'low' priority:
        // https://github.com/ckeditor/ckeditor5/blob/master/packages/ckeditor5-enter/src/enter.ts#L61
        // so this event's priority must be higher than 'low'.
        const eventPriority = 'normal';

        this.listenTo<ViewDocumentEnterEvent>( viewDocument, 'enter', ( _, data ) => {
            // When not in composition, we handle the action, so prevent the default one.
            // When in composition, it's the browser who modify the DOM (renderer is disabled).
            if ( !viewDocument.isComposing ) {
                data.preventDefault();
            }

            // Add a temporary suffix so that a restricted editing area will be created in the next line
            this.editor.execute('addSuffix', { suffix: RestrictedEditingEnter.temporarySuffix } as AddSuffixParams);
        }, { priority: eventPriority });
	}

    public afterInit(): void {
		const editor = this.editor;
		const enterCommand = editor.commands.get( 'enter' )!;

        // After the EnterCommand operates, it fires a EnterCommandAfterExecuteEvent:
        // https://github.com/ckeditor/ckeditor5/blob/master/packages/ckeditor5-enter/src/entercommand.ts#L29

        // After the EnterCommand operated, we remove the temporary suffix
        this.listenTo<EnterCommandAfterExecuteEvent>( enterCommand, 'afterExecute', ( event, data ) => {
            // Remove the temporary suffix after the enter command put a line break and a restricted editing mode area
            this.editor.execute('removeSuffix', { suffixLength: RestrictedEditingEnter.temporarySuffix.length }  as RemoveSuffixParams);
		} );

        const shiftEnterCommand = editor.commands.get( 'shiftEnter' )!;

        // Same for ShiftEnterCommand:
        // https://github.com/ckeditor/ckeditor5/blob/master/packages/ckeditor5-enter/src/shiftentercommand.ts#L36
        this.listenTo<EnterCommandAfterExecuteEvent>( shiftEnterCommand, 'afterExecute', ( event, data ) => {
            // Remove the temporary suffix after the enter command put a line break and a restricted editing mode area
            this.editor.execute('removeSuffix', { suffixLength: RestrictedEditingEnter.temporarySuffix.length } as RemoveSuffixParams);
		} );
	}
}