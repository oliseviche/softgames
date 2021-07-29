// Wrapper component for rendering sombined texts and images together
// Holds creation and application logic for calculating geometry

import * as PIXI from 'pixi.js'

const DEFAULT_FONT_SIZE = 16;

type Metrics = { width: number, height: number };

interface ComponentConstructor {
    new(...args: any[]): IComponent
}

interface IComponent {
    is<T extends ComponentConstructor>(constructor: T): this is InstanceType<T>
}

class TextComponent implements IComponent {
    constructor(public readonly text: string) {
    }

    is<T extends ComponentConstructor>(constructor: T): this is InstanceType<T> {
        return this instanceof constructor;
    }
}

class ImageComponent implements IComponent {
    constructor(public texture: PIXI.Texture, public frame?: PIXI.Rectangle) {
    }

    is<T extends ComponentConstructor>(constructor: T): this is InstanceType<T> {
        return this instanceof constructor;
    }
}

export class RichText {
    visual: PIXI.Container = new PIXI.Container();
    width: number = 0;
    height: number = 0;

    constructor(components: IComponent[], fontSize: number = DEFAULT_FONT_SIZE) {
        this.setContent(components, fontSize);
    }

    static create(args: (string | PIXI.Texture)[], fontSize: number = DEFAULT_FONT_SIZE): RichText {
        const components: IComponent[] = [];

        args.forEach((entry: string | PIXI.Texture) => {
            const component = 'string' === typeof entry ? new TextComponent(entry) : new ImageComponent(entry);
            components.push(component);
        });

        return new RichText(components, fontSize);
    }

    static createText(text: string): TextComponent {
        return new TextComponent(text);
    }

    static createImage(texture: PIXI.Texture): ImageComponent {
        return new ImageComponent(texture);
    }

    setContent(content: IComponent[], fontSize: number) {
        let maxHeight = 0;
        let left = 0;
        let descent = 0;

        const tuples: [PIXI.DisplayObject, Metrics][] = [];
        const style = new PIXI.TextStyle({ fontSize: fontSize });

        this.visual.removeChildren();

        content.forEach(component => {
            if (component.is(TextComponent)) {
                const metrics = PIXI.TextMetrics.measureText(component.text, style);
                const text = new PIXI.Text(component.text, style);
                maxHeight = Math.max(metrics.height, maxHeight);
                tuples.push([text, { width: metrics.width, height: metrics.fontProperties.ascent }]);
                descent = metrics.fontProperties.descent;
            } else if (component.is(ImageComponent)) {
                const sprite = new PIXI.Sprite(component.texture);
                tuples.push([sprite, { width: sprite.width, height: sprite.height }])
            }
        });

        for(let i = 0; i < tuples.length; i++) {
            const [visual, metrics] = tuples[i];
            const koeff = maxHeight / (metrics.height - descent);

            if (koeff !== 1) {
                metrics.width *= koeff;
                metrics.height *= koeff;
                visual.scale = new PIXI.Point(koeff, koeff);
            }

            visual.position.set(left, maxHeight - (metrics.height || maxHeight));
            left += metrics.width;

            this.visual.addChild(visual);
        }

        this.width = left;
        this.height = maxHeight;
    }

    destroy() {
        this.visual.removeChildren()
            .forEach(child => child.destroy());
    }
}