import { Command, Range, Plugin, Batch } from 'ckeditor5';

// AddSuffixCommand and RemoveSuffixCommand share the same "batch operation",
// so that the undo command will undo both the Add and Remove suffix operations together.
// (squashes the add/remove)
interface BatchStore {
    currentBatch?: Batch;
}

// Suffix is a plugin that manages the AddSuffixCommand and RemoveSuffixCommand commands
// The AddSuffixCommand adds a suffix at the current cursor position before enter is processed.
// The RemoveSuffixCommand removes the suffix after the 'enter' is processed.
// This is done so that the 'enter' occurs within a text area that is editable in restricted mode.
// This way the text created on the next line is also editable.
export class Suffix extends Plugin {

    public static readonly suffix = " ";

    public static get pluginName() {
		return 'Suffix' as const;
	}

    public static get requires() {
		return [ AddSuffixCommand, RemoveSuffixCommand ] as const;
	}

    private store: BatchStore = { };

	public init(): void {
        const addSuffix = new AddSuffixCommand(this.editor);
        addSuffix.batchStore = this.store;
        this.editor.commands.add('addSuffix', addSuffix);

        const removeSuffix = new RemoveSuffixCommand(this.editor);
        removeSuffix.batchStore = this.store;
        this.editor.commands.add('removeSuffix', removeSuffix);
	}
}

export interface AddSuffixParams {
    suffix: string
};

export class AddSuffixCommand extends Command {

    batchStore: BatchStore = { };

    public override execute(params: AddSuffixParams): void {
        this.batchStore.currentBatch = this.editor.model.createBatch();
        
        this.editor.model.enqueueChange(this.batchStore.currentBatch, writer => {
            // The selection is the editor's position
            const selection = this.editor.model.document.selection;
            const originalRange = selection.getFirstRange()!;

            // This command doesn't support selection of multiple characters, only position
            if (!selection.isCollapsed) {
                return;
            }

            writer.insertText(params.suffix, selection.getFirstPosition()!, 'before');
            // Move editor's position/selection to be before suffix
            writer.setSelection(originalRange);
        });
	}
}

export interface RemoveSuffixParams {
    suffixLength: number
};

export class RemoveSuffixCommand extends Command {

    batchStore: BatchStore = { };

    public override execute(params: RemoveSuffixParams): void {
		const editor = this.editor;
        
        this.editor.model.enqueueChange(this.batchStore.currentBatch, writer => {
            const selection = editor.model.document.selection!;
            const range = selection.getFirstRange()!;
			const suffixRange = new Range(range.start, range.start.getShiftedBy(params.suffixLength));

			writer.remove(suffixRange);
        });
	}
}

