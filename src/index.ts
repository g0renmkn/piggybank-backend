import PiggyApp from './app.ts';
import { PiggybankModelVar } from './models/PiggybankModelVar.ts';
import { PiggybankModelMysql } from './models/PiggybankModelMysql.ts';
import { cfg } from './cfg.ts';
import { type PiggybankModel } from './models/ModelDefinitions.ts';

let model: PiggybankModel;

// Choose data model
if (cfg.model==='mysql') {
    model = new PiggybankModelMysql({
        host: cfg.dbHost,
        port: cfg.dbPort,
        user: cfg.dbUser,
        password: cfg.dbPass,
        database: cfg.dbName
    });
}
else {
    model = new PiggybankModelVar();
}

await model.initModel();
const app = new PiggyApp(model);

app.listen();
