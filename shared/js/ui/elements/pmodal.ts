namespace ui {
    namespace modal {
        export interface ModalController {
            open() : Promise<void>;             /* will be forwarded to the renderer */
            is_shown() : Promise<boolean>;      /* will be forwarded to the renderer */
            close() : Promise<void>;            /* will be forwarded to the renderer */
            destroy() : Promise<void>;          /* will be forwarded to the renderer */
        }
        
        export interface ModalRenderer {
            open();
            is_shown();
            close();
            destroy();
        }

        interface PopupController extends ModalController {
            add_popup(message: string);
        }

        interface PopupRenderer extends ModalController {
            add_popup(message: string);
        }
    }
}

{
    type StringLiteralDiff<T extends string | number | symbol, U extends string | number | symbol> = ({[P in T]: P } & {[P in U]: never } & { [x: string]: never })[T];
    type Omit<T, K extends keyof T> = Pick<T, StringLiteralDiff<keyof T, K>>;

    interface Input<TValue> {
        getValue(): TValue;
        setValue(value: TValue): void;
        clear(): void;
    }

    interface TextInput extends Omit<Input<string>, 'setValue'> {

        setText(text: string): void;
    }

    let x = {} as TextInput;
    x.setValue('s');
    x.clear();
}
{
    //
    type PickP<T, K extends keyof T> = {
        [P in K]: T[P] extends (...args: any) => any ? T[K] : never;
    };
    type Omit<T> = PickP<T, keyof T>;

    interface Input<TValue> {
        getValue(): TValue;
        setValue(value: TValue): void;
        clear(): void;

        property: string;
    }

    interface TextInput extends Omit<Input<string>> {
        a();
        test() : Promise<void>;
    }

    let x = {} as TextInput;
    x.getValue();
}