// This scene is responsible for providing presentation for cards stack

import * as PIXI from 'pixi.js';
import { Engine } from "../../core/engine";
import { ITask, TaskRunner } from "../../core/task-runner";
import { cardsUrl } from '../../resources';
import { BaseScene } from '../scene';

let screenWidth = 0;
let screenHeight = 0;

const CARDS_COUNT = 144;
const NEXT_CARD_DELAY = 1000;
const TIME_TO_TRANLATE = 2000;

class Card {
    width: number = 0;
    height: number = 0;
    visual: PIXI.Sprite;

    constructor(texture: PIXI.Texture) {
        this.visual = new PIXI.Sprite(texture);
        this.width = texture.width
        this.height = texture.height
    }

    destroy() {
        this.visual.destroy({
            texture: true,
            children: true,
            baseTexture: true
        });
    }
}

function cardDelayTask(delta: number, context: { passed: 0, cards: Card[], index: number, wait: number }, task: ITask, runner: TaskRunner) {
    let { cards, index, wait } = context;

    context.passed += delta;

    if (context.passed > wait) {
        if (index !== cards.length) {
            const finalPosition = screenWidth - cards[index].width - cards[index].visual.x;

            runner.addTask(cardAnimationTask, { finalPosition, timeToTranslate: TIME_TO_TRANLATE, card: cards[index] });
            runner.addTask(cardDelayTask, { passed: 0, cards: cards, index: ++index, wait: NEXT_CARD_DELAY });
        }
        task.stop();
    }
}

function cardAnimationTask(delta: number, context: { finalPosition: number, timeToTranslate: number, card: Card }, task: ITask) {
    let { finalPosition, timeToTranslate, card } = context;
    const velocity = (finalPosition - card.visual.x) / timeToTranslate;

    card.visual.x += velocity * delta;
    context.timeToTranslate -= delta;

    if (timeToTranslate <= 0) {
        card.visual.zIndex = -1;
        card.visual.x = finalPosition;
        task.stop();
    }
}

export class CardsScene extends BaseScene {
    private cards: Card[] = [];

    constructor(protected engine: Engine) {
        super(engine);

        screenWidth = this.engine.renderer.screen.width;
        screenHeight = this.engine.renderer.screen.height;

        const { loader } = engine;
        this.sceneContainer.sortableChildren = true;

        const texture = this.getCardTexture();
        if (texture) {
            this.initializeScene()
        } else {
            loader.add(cardsUrl).load(() => this.initializeScene());
        }
    }

    destroy() {
        super.destroy();
        this.cards.forEach(card => card.destroy);
    }

    private getCardTexture(): PIXI.Texture | undefined {
        return this.engine.loader.resources[cardsUrl[0]]?.texture;
    }

    private initializeScene(): void {
        super.initialized();

        const {taskRunner, loader} = this.engine;
        const texture = loader.resources[cardsUrl[0]].texture;

        let x = 10;
        let y = (screenHeight - texture.height) * .5;

        for (let i = 0; i < CARDS_COUNT; i++) {
            const textureName = cardsUrl[i % 5];
            const card = new Card(loader.resources[textureName].texture);
            card.visual.position.set(x, y);
            this.cards.unshift(card);
            this.sceneContainer.addChild(card.visual);
            y += 0.3;
            x += 0.2;
        }

        taskRunner.addTask(cardDelayTask, { passed: 0, cards: this.cards, index: 0, wait: 200 });
    }
}