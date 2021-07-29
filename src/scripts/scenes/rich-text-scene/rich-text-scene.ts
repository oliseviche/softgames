import * as PIXI from 'pixi.js';
import { Engine } from "../../core/engine";
import { RichText } from '../../widgets/rich-text';
import { getRandomValue } from '../../utils';
import { BaseScene } from "../scene";
import { emojiesUrl } from '../../resources';

let screenWidth = 0;
let screenHeight = 0;

const WORDS = "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum".split(' ');

function richTextBuddingTask(delta: number, context: { timePassed: number, richText: RichText, texture: PIXI.Texture }) {
    context.timePassed += delta;
    const { richText, texture } = context;

    if (context.timePassed > 1000) {
        context.timePassed = 0;

        const components = [];

        for (let i = 0; i < 3; i++) {
            const type = getRandomValue(0, 2);

            if (type === 0) {
                const index = getRandomValue(0, 1000);
                const col = (index / 40) | 0;
                const row = index - col * 40;

                texture.frame = new PIXI.Rectangle(col * 64 + 1, row * 64 + 1, 64, 64);
                components.push(RichText.createImage(texture));
            } else {
                const index = getRandomValue(0, WORDS.length);

                components.push(RichText.createText(WORDS[index]));
            }

            components.push((RichText.createText(i < 2 ? " " : "")));
        }

        const fontSize = getRandomValue(16, 16 * 5);

        richText.setContent(components, fontSize);
        richText.visual.position.set((screenWidth - richText.width) * .5, (screenHeight - richText.height) * .5);
    }
}

export class RichTextScene extends BaseScene {
    richText: RichText;

    constructor(protected engine: Engine) {
        super(engine);

        const { loader } = engine;

        screenWidth = engine.renderer.screen.width;
        screenHeight = engine.renderer.screen.height;

        this.richText = new RichText([]);

        if (loader.resources[emojiesUrl]) {
            this.initializeScene();
        } else {
            loader
                .add(emojiesUrl)
                .load(() => this.initializeScene());
        }
    }

    private initializeScene() {
        super.initialized();

        const { loader, taskRunner } = this.engine;
        const texture = loader.resources[emojiesUrl].texture;

        taskRunner.addTask(richTextBuddingTask, { timePassed: 2000, richText: this.richText, texture });

        this.sceneContainer.addChild(this.richText.visual);
    }

    destroy() {
        super.destroy();
        this.richText.destroy();
    }
}