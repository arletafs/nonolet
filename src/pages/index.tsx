import * as React from 'react';
import { AggregatorContainer } from '~/components/Aggregator';
import Layout from '~/layout';


export default function Aggregator() {

	return (
		<Layout title={`Meta-dex aggregator - DefiLlama`} defaultSEO>
			<AggregatorContainer />
		</Layout>
	);
	
}
