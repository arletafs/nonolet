import * as React from 'react';
import { AggregatorContainer } from '~/components/Aggregator';
import Layout from '~/layout';

export default function Aggregator() {
	const [settingsHandler, setSettingsHandler] = React.useState<(() => void) | undefined>();

	const handleProvideSettings = React.useCallback((handler: () => void) => {
		setSettingsHandler(() => handler);
	}, []);

	return (
		<Layout
			title={`Nonolet - All aggregators. All stablecoins. All at once.`}
			defaultSEO
			onSettingsClick={settingsHandler}
		>
			<AggregatorContainer onProvideSettingsHandler={handleProvideSettings} />
		</Layout>
	);
}
