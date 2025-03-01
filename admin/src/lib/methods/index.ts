import { mutateFnByPathPorduct } from './product';
import { mutateFnByPathStore } from './store';
import { mutateFnByPathUser } from './user';

export const multateByPath = {
	...mutateFnByPathUser,
	...mutateFnByPathStore,
	...mutateFnByPathPorduct
};
