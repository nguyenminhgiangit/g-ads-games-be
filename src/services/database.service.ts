import { GameService } from "./game.service";

export async function onDBInit() {
    await GameService.initCurrentConfigs();
}


