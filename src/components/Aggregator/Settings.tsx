import { InfoOutlineIcon } from '@chakra-ui/icons';
import {
	Button,
	Checkbox,
	Heading,
	HStack,
	List,
	ListItem,
	Modal,
	ModalBody,
	ModalCloseButton,
	ModalContent,
	ModalFooter,
	ModalHeader,
	ModalOverlay,
	Switch,
	Tooltip,
	useDisclosure
} from '@chakra-ui/react';
import styled from 'styled-components';
import { chunk } from 'lodash';
import { useLocalStorage } from '~/hooks/useLocalStorage';
import { Slippage } from '../Slippage';

// Clean Minimalist Modal Styling - Enhanced legibility with subtle glass effects
const LiquidGlassOverlay = styled(ModalOverlay)`
	backdrop-filter: blur(8px);
	background: rgba(0, 32, 58, 0.3) !important;
`;

const LiquidGlassContent = styled(ModalContent)`
	background: rgba(255, 255, 255, 0.95) !important;
	backdrop-filter: blur(16px);
	border: 1px solid rgba(255, 255, 255, 0.8);
	border-radius: 16px !important;
	box-shadow: 
		0 8px 32px rgba(0, 32, 58, 0.15),
		0 4px 16px rgba(0, 32, 58, 0.1);
	color: #2D3748 !important;
	max-width: 480px !important;
`;

const LiquidGlassHeader = styled(ModalHeader)`
	background: rgba(255, 255, 255, 0.6);
	border-bottom: 1px solid rgba(0, 32, 58, 0.1);
	border-radius: 16px 16px 0 0 !important;
	color: #1A202C !important;
	font-weight: 600;
	font-size: 20px;
`;

const LiquidGlassBody = styled(ModalBody)`
	background: rgba(255, 255, 255, 0.4);
	color: #2D3748 !important;
	
	/* Custom styling for child elements */
	.chakra-heading {
		color: #1A202C !important;
		font-weight: 600;
	}
	
	.chakra-checkbox__label {
		color: #2D3748 !important;
		font-weight: 500;
	}
	
	.chakra-checkbox__control {
		background: rgba(255, 255, 255, 0.8) !important;
		border: 1px solid rgba(0, 32, 58, 0.2) !important;
		
		&[data-checked] {
			background: #3793FF !important;
			border-color: #3793FF !important;
		}
	}
	
	.chakra-switch__track {
		background: rgba(0, 32, 58, 0.15) !important;
		
		&[data-checked] {
			background: #3793FF !important;
		}
	}
	
	/* Slippage component clean styling */
	input[type="text"] {
		background: rgba(255, 255, 255, 0.9) !important;
		border: 1px solid rgba(0, 32, 58, 0.2) !important;
		color: #2D3748 !important;
		border-radius: 8px !important;
		transition: border-color 0.2s ease;
		
		&:focus {
			border-color: #3793FF !important;
			outline: none;
		}
		
		&::placeholder {
			color: #718096 !important;
		}
	}
	
	.chakra-button {
		background: rgba(255, 255, 255, 0.8) !important;
		border: 1px solid rgba(0, 32, 58, 0.15) !important;
		color: #2D3748 !important;
		border-radius: 8px !important;
		font-weight: 500;
		transition: all 0.2s ease;
		
		&:hover {
			background: rgba(255, 255, 255, 0.95) !important;
			border-color: #3793FF !important;
		}
		
		&[data-active="true"], &[aria-pressed="true"] {
			background: #3793FF !important;
			border-color: #3793FF !important;
			color: white !important;
		}
	}
	
	.chakra-alert {
		background: rgba(255, 235, 156, 0.9) !important;
		border: 1px solid rgba(217, 154, 15, 0.3) !important;
		border-radius: 8px !important;
		color: #744210 !important;
	}
	
	.chakra-popover__content {
		background: rgba(255, 255, 255, 0.95) !important;
		backdrop-filter: blur(8px);
		border: 1px solid rgba(0, 32, 58, 0.1) !important;
		border-radius: 8px !important;
		color: #2D3748 !important;
		box-shadow: 0 8px 24px rgba(0, 32, 58, 0.1);
	}
`;

const LiquidGlassFooter = styled(ModalFooter)`
	background: rgba(255, 255, 255, 0.6);
	border-top: 1px solid rgba(0, 32, 58, 0.1);
	border-radius: 0 0 16px 16px !important;
	
	.chakra-button {
		background: #3793FF !important;
		border: 1px solid #3793FF;
		color: white !important;
		font-weight: 600;
		border-radius: 8px !important;
		padding: 12px 24px !important;
		transition: all 0.2s ease;
		
		&:hover {
			background: #2d7dd2 !important;
			border-color: #2d7dd2;
		}
	}
`;

const LiquidGlassCloseButton = styled(ModalCloseButton)`
	color: #718096 !important;
	background: rgba(255, 255, 255, 0.8);
	border-radius: 6px;
	border: 1px solid rgba(0, 32, 58, 0.1);
	transition: all 0.2s ease;
	
	&:hover {
		background: rgba(255, 255, 255, 0.95);
		color: #2D3748 !important;
	}
`;

export const Settings = ({ adapters, disabledAdapters, setDisabledAdapters, onClose: onExternalClose, slippage, setSlippage, finalSelectedFromToken, finalSelectedToToken }) => {
	const [isDegenModeEnabled, setIsDegenModeEnabled] = useLocalStorage('llamaswap-degenmode', false);
	const { isOpen, onClose } = useDisclosure({ defaultIsOpen: true });
	const onCloseClick = () => {
		onExternalClose();
		onClose();
	};
	const onClick = (name) => (e) => {
		const isChecked = e.target.checked;

		setDisabledAdapters((adaptersState) =>
			isChecked ? adaptersState.filter((adapterName) => adapterName !== name) : adaptersState.concat(name)
		);
	};
	const aggregatorChunks = chunk(adapters as Array<string>, 5);
	return (
		<>
			<Modal isOpen={isOpen} onClose={onCloseClick} size={'lg'}>
				<LiquidGlassOverlay />
				<LiquidGlassContent justifyContent={'center'}>
					<LiquidGlassHeader>Settings</LiquidGlassHeader>
					<LiquidGlassCloseButton />
					<LiquidGlassBody>
						<HStack mt={1} mb={2}>
							<Heading size={'xs'}>Slippage (%)</Heading>
						</HStack>
						<HStack mt={1} mb={4}>
							<div className="slippage-container">
								<Slippage
									slippage={slippage}
									setSlippage={setSlippage}
									fromToken={finalSelectedFromToken?.symbol}
									toToken={finalSelectedToToken?.symbol}
								/>
							</div>
						</HStack>

						<HStack mt={1} mb={4}>
							<Heading size={'xs'}>Degen Mode</Heading>{' '}
							<Tooltip
								label="Disable price impact warnings."
								bg="rgba(0, 32, 58, 0.9)"
								color="white"
								borderRadius="6px"
								fontSize="sm"
								fontWeight="500"
								px="3"
								py="2"
							>
								<InfoOutlineIcon color="#718096" />
							</Tooltip>
							<Switch
								onChange={() => setIsDegenModeEnabled((mode) => !mode)}
								isChecked={isDegenModeEnabled}
								colorScheme="blue"
							/>
						</HStack>
						<Heading size={'xs'}>Enabled Aggregators</Heading>

						<HStack mt={4}>
							{aggregatorChunks.map((aggs) => (
								<List key={aggs.join(',')} spacing={1.5}>
									{aggs.map((name) => (
										<ListItem key={name}>
											<Checkbox
												mr={2}
												isChecked={!disabledAdapters.includes(name)}
												onChange={onClick(name)}
												colorScheme="blue"
											/>
											{name}
										</ListItem>
									))}
								</List>
							))}
						</HStack>
					</LiquidGlassBody>

					<LiquidGlassFooter>
						<Button mr={3} onClick={onCloseClick}>
							Close
						</Button>
					</LiquidGlassFooter>
				</LiquidGlassContent>
			</Modal>
		</>
	);
};
