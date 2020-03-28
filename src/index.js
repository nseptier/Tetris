import asciiRenderer from 'models/renderers/ascii';
import Core from 'models/core';
import Game from 'models/game';
import InputsHandler from 'models/inputs-handler';
import NewGameState from 'models/states/new-game';
import './styles.scss';

const inputsHandler = new InputsHandler(document.body);
const game = new Game();
const renderer = asciiRenderer(game.width, game.height);
const state = new NewGameState({ game });
const core = new Core({ inputsHandler, renderer, state });

core.loop();
