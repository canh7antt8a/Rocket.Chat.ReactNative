import { PixelRatio } from 'react-native';

import { SubscriptionType } from '../../../definitions';
import { IAvatar } from '../../../containers/Avatar/interfaces';
import { compareServerVersion } from './compareServerVersion';
import { store as reduxStore } from '../../store/auxStore';

const formatUrl = (url: string, size: number, query?: string) => `${url}?format=png&size=${PixelRatio.get() * size}${query}`;

export const getAvatarURL = ({
	type,
	text = '',
	size = 25,
	userId,
	token,
	avatar,
	avatarETag,
	rid,
	blockUnauthenticatedAccess,
	serverVersion,
	externalProviderUrl
}: IAvatar): string => {
	const server = reduxStore.getState().share.server.server || reduxStore.getState().server.server;
	let room;
	if (type === SubscriptionType.DIRECT) {
		room = text;
		if (externalProviderUrl) {
			const externalUri = externalProviderUrl.trim().replace(/\/+$/, '').replace('{username}', room);
			return formatUrl(`${externalUri}`, size);
		}
	} else if (rid && !compareServerVersion(serverVersion, 'lowerThan', '3.6.0')) {
		room = `room/${rid}`;
	} else {
		room = `@${text}`;
	}

	let query = '';
	if (userId && token && blockUnauthenticatedAccess) {
		query += `&rc_token=${token}&rc_uid=${userId}`;
	}
	if (avatarETag) {
		query += `&etag=${avatarETag}`;
	}

	if (avatar) {
		if (avatar.startsWith('http')) {
			return avatar;
		}

		return formatUrl(`${server}${avatar}`, size, query);
	}

	return formatUrl(`${server}/avatar/${room}`, size, query);
};
