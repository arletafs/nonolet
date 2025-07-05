import { Heading, Image } from '@chakra-ui/react';
import styled from 'styled-components';
import logo from '~/public/nonolet.svg';

const Wrapper = styled.div`
	z-index: 100;
	display: flex;
	justify-content: space-between;
`;

const Name = styled(Heading)`
	font-size: 26px;
`;

const Header = ({ children }) => {
	return (
		<Wrapper>
			<Name
				fontSize={['26px', '26px', '32px', '32px']}
				display="flex"
				alignItems="center"
				onClick={() => window.open('https://swap.defillama.com/')}
				cursor="pointer"
				fontFamily="Urbanist"
			>
				<Image
					src={logo.src}
					w={['110px', '110px', '110px', '110px']}
					h={['25px', '25px', '25px', '25px']}
					mr="8px"
					alt="logo"
				/>
			</Name>
			{children}
		</Wrapper>
	);
};

export default Header;
