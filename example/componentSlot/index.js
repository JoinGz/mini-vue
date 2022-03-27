import { createApp } from '../../lib/index.esm.js'
import {helloWorld as app} from './app.js'

const appEle = document.querySelector('#app')
createApp(app).mount(appEle)


