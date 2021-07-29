// Main workhorse
// Initialize PIXI and creates helper classes for orchestrating tasks, resources, scenes

import * as PIXI from 'pixi.js'
import { SceneDirector } from './scene-director';
import { TaskRunner } from "./task-runner";

export class Engine {
    loader: PIXI.Loader;
    renderer: PIXI.Renderer;
    stage: PIXI.Container;
    taskRunner: TaskRunner;
    sceneDirector: SceneDirector;

    private container: HTMLElement;

    constructor() {
        const dimensions = this.getScreenDimenions();
        const pixelRatio = window.devicePixelRatio;

        this.loader = PIXI.Loader.shared;
        this.renderer = PIXI.autoDetectRenderer({
            width: dimensions.width * pixelRatio,
            height: dimensions.height * pixelRatio,
            antialias: false,
            autoDensity: true,
            resolution: pixelRatio,
            transparent: true
        });

        this.stage = new PIXI.Container();

        this.taskRunner = new TaskRunner();
        this.sceneDirector = new SceneDirector(this);

        this.resizeView();

        this.container = document.getElementById('game') || document.body;
        this.container.appendChild(this.renderer.view);

        window.addEventListener('resize', () => this.resizeView());
    }

    getScreenDimenions(): { width: number, height: number } {
        const rect = document.body.getBoundingClientRect();
        return { width: rect.width, height: rect.height };
    }

    resizeView() {
        const dimensions = this.getScreenDimenions();
        this.renderer.resize(dimensions.width, dimensions.height);
    }
}