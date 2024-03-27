/**
 * Making sure the first thing the code does (before every test) is changing the
 * captureRejections option to true to account for all new instances of
 * EventEmitter
 */
import { EventEmitter } from 'node:events';

// See: https://nodejs.org/api/events.html#capture-rejections-of-promises
EventEmitter.captureRejections = true;
