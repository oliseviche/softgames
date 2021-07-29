import * as PIXI from 'pixi.js';
import { Engine } from "../../core/engine";
import { CardsScene } from '../card-scene/cards-scene';
import { FireScene } from '../fire-scene/fire-scene';
import { RichTextScene } from '../rich-text-scene/rich-text-scene';
import { BaseScene, SceneConstructor } from "../scene";

const MENU_OFFSET = 10;

export class MenuScene extends BaseScene {
    private scenes: SceneConstructor[] = [CardsScene, RichTextScene, FireScene];

    constructor(protected engine: Engine) {
        super(engine);

        super.initialized();

        this.backButton.renderable = false;

        const style = new PIXI.TextStyle({
            fontFamily: 'Arial',
            fontSize: 36,
            fontStyle: 'italic',
            fontWeight: 'bold',
            fill: ['#ffffff', '#00ff99'], // gradient
            stroke: '#4a1850',
            strokeThickness: 5,
            dropShadow: true,
            dropShadowColor: '#000000',
            dropShadowBlur: 4,
            dropShadowAngle: Math.PI / 6,
            dropShadowDistance: 6,
            wordWrap: true,
            wordWrapWidth: 440,
            lineJoin: 'round',
        });

        const container = new PIXI.Container();

        const cardsMenuItem = new PIXI.Text('Cards demo', style);
        cardsMenuItem.interactive = true;
        cardsMenuItem.buttonMode = true;
        cardsMenuItem.x = 0;
        cardsMenuItem.y = 0;

        const richTextMenuItem = new PIXI.Text('RichText demo', style);
        richTextMenuItem.interactive = true;
        richTextMenuItem.buttonMode = true;
        richTextMenuItem.x = 0;
        richTextMenuItem.y = cardsMenuItem.y + cardsMenuItem.height + MENU_OFFSET;

        const fireMenuItem = new PIXI.Text('Fire demo', style);
        fireMenuItem.interactive = true;
        fireMenuItem.buttonMode = true;
        fireMenuItem.x = 0;
        fireMenuItem.y = richTextMenuItem.y + richTextMenuItem.height + MENU_OFFSET;

        container.addChild(cardsMenuItem);
        container.addChild(richTextMenuItem);
        container.addChild(fireMenuItem)

        container.x = (engine.renderer.screen.width - container.width) * .5;
        container.y = (engine.renderer.screen.height - container.height) * .5;

        container.interactive = true;
        container.on('pointerdown', (event: PIXI.interaction.InteractionEvent) => {
            let sceneToPush = null;
            switch(event.target) {
                case cardsMenuItem:
                    sceneToPush = this.scenes[0]
                break;
                case richTextMenuItem:
                    sceneToPush = this.scenes[1];
                break;
                case fireMenuItem:
                    sceneToPush = this.scenes[2];
                break;
            }
            if (sceneToPush) {
                engine.sceneDirector.push(sceneToPush);
            }
        });

        engine.stage.addChild(container);
    }

    destroy() {
        this.engine.stage.removeChildren();
    }
}