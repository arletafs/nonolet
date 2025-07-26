import styled from 'styled-components';

const LoaderWrapper = styled.div`
	margin: 0 auto;
	margin-top: 72px;
`;

const LoaderText = styled.div`
	font-size: 20px;
	font-weight: 500;
	text-align: center;
	padding: 20px;
`;

const Loader = (props) => {
	return (
		<LoaderWrapper {...props}>
			<LoaderText>Loading...</LoaderText>
		</LoaderWrapper>
	);
};

export default Loader;
