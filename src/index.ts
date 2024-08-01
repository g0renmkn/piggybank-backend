import PiggyApp from './app.ts';
import { PiggybankModelVar } from './models/PiggybankModelVar.ts';

const app = new PiggyApp(new PiggybankModelVar())

app.listen();
