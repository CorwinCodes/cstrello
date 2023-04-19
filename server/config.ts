import dotenv from 'dotenv';
import _ from 'lodash';

const result = dotenv.config();

export let envs: any;

if (!('error' in result)) {
  envs = result.parsed;
} else {
  envs = {};
  _.each(process.env, (value, key) => envs[key] = value);
}