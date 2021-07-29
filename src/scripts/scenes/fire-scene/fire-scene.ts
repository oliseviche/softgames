import * as PIXI from 'pixi.js';
import * as particles from 'pixi-particles'
import { Engine } from "../../core/engine";
import { BaseScene } from "../scene";
import { config } from "./fire-config";
import { fireUrls } from '../../resources';

function animateFireTask(delta: number, context: { emitter: particles.Emitter }) {
    context.emitter.update(delta * 0.001);
}

export class FireScene extends BaseScene {
    private emitter: particles.Emitter | undefined;
    private textures: PIXI.Texture[] = [];

    constructor(protected engine: Engine) {
        super(engine);

        const { taskRunner } = engine;

        this.engine.loader
            .add(fireUrls)
            .load(() => {
                super.initialized();

                for (let i = 0; i < fireUrls.length; ++i) {
                    this.textures.push(this.engine.loader.resources[fireUrls[i]].texture);
                }

                const emitterContainer = new PIXI.Container();
                const emitter = new particles.Emitter(emitterContainer, this.textures, config);
                
                emitter.updateOwnerPos(window.innerWidth * .5, window.innerHeight * .5);

                taskRunner.addTask(animateFireTask, { emitter });

                engine.stage.addChild(emitterContainer);
            });
    }

    destroy() {
        super.destroy();
        this.textures.forEach(texture => texture.destroy(true));
        if (this.emitter) {
            this.emitter.destroy();
        }
    }
}