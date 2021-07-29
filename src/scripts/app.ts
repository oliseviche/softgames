import { Engine } from './core/engine';
import { MenuScene } from './scenes/menu-scene/menu-scene';
import { FPSMeter } from './utils';

const engine = new Engine();

window.onload = () => {
    const fpsMeter = FPSMeter(document.getElementById('fpsMeter'))
    engine.sceneDirector.push(MenuScene);
   
    (function render(time: number): void {
        fpsMeter.measure(time);
        engine.taskRunner.update(time);
        engine.renderer.render(engine.stage);
        requestAnimationFrame(render);
    })(0);

    fpsMeter.show();
};