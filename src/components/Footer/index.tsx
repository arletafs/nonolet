import {
	Image,
	Link,
	Button,
	Textarea,
	useToast,
	Modal,
	ModalOverlay,
	ModalContent,
	ModalHeader,
	ModalBody,
	ModalCloseButton,
	useDisclosure
} from '@chakra-ui/react';
import styled from 'styled-components';
import llamaSwapIcon from '~/public/loader.png';
import { useState } from 'react';

const FooterWrapper = styled.div`
	display: flex;
    flex-direction: column;
	align-items: center;
    width: 100vw;
    border-radius: 20px 20px 0 0;
	background-color: #131926;
	color: #FFFFFF;
	padding: 16px;
	position: fixed;
	bottom: 0;
	left: 0;
	right: 0;
	z-index: 9999;
	font-family: 'Urbanist', sans-serif;
	box-shadow: 0 -4px 6px -1px rgba(0, 0, 0, 0.1), 0 -2px 4px -1px rgba(0, 0, 0, 0.06);
`;

const FeedbackForm = styled.form`
	display: flex;
	flex-direction: column;
	gap: 16px;
	width: 100%;
	max-width: 500px;
`;

const FormField = styled.div`
	display: flex;
	flex-direction: column;
	gap: 8px;
`;





const StyledTextarea = styled(Textarea)`
	background: rgba(255, 255, 255, 0.9) !important;
	border: 1px solid rgba(0, 32, 58, 0.2) !important;
	color: #2D3748 !important;
	border-radius: 8px !important;
	font-family: 'Urbanist', sans-serif;
	resize: vertical;
	min-height: 120px;
	
	&:focus {
		border-color: rgba(59, 130, 246, 0.5) !important;
		box-shadow: 0 0 0 1px rgba(59, 130, 246, 0.2) !important;
	}
`;

const SubmitButton = styled(Button)`
	background: linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%) !important;
	color: white !important;
	font-weight: 600 !important;
	border-radius: 8px !important;
	font-family: 'Urbanist', sans-serif;
	height: 44px !important;
	
	&:hover {
		background: linear-gradient(135deg, #2563EB 0%, #1E40AF 100%) !important;
		transform: translateY(-1px) !important;
		box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3) !important;
	}
	
	&:disabled {
		background: #CBD5E0 !important;
		transform: none !important;
		box-shadow: none !important;
	}
`;

export default function Footer() {
	const { isOpen, onOpen, onClose } = useDisclosure();
	const [isSubmitting, setIsSubmitting] = useState(false);
	const toast = useToast();

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		setIsSubmitting(true);

		// Capture form reference before async operation
		const form = e.currentTarget;
		const formData = new FormData(form);

		try {
			const response = await fetch('https://formspree.io/f/mpwllpzl', {
				method: 'POST',
				body: formData,
				headers: {
					'Accept': 'application/json'
				}
			});

			if (response.ok) {
				// Reset form before closing modal
				form.reset();

				toast({
					title: 'Feedback sent',
					description: 'Thank you for your feedback. We\'ll get back to you soon',
					status: 'success',
					variant: 'solid-success',
					duration: 5000,
					isClosable: true,
					position: 'top-right',
					containerStyle: {
						width: '100%',
						maxWidth: '350px',
						marginTop: '20px'
					}
				});

				// Close modal after reset
				onClose();
			} else {
				throw new Error('Failed to send feedback');
			}
		} catch (error) {
			toast({
				title: 'Error',
				description: 'Failed to send feedback. Please try again',
				status: 'error',
				variant: 'solid-error',
				duration: 5000,
				isClosable: true,
				position: 'top-right',
				containerStyle: {
					width: '100%',
					maxWidth: '350px',
					marginTop: '20px'
				}
			});
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<>
			<FooterWrapper>
				<div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: '85%' }}>
					<div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'center', gap: '4px' }}>
						<span style={{ fontSize: '24px', fontWeight: '600' }}>Nonolet</span>
						<span style={{ fontSize: '12px', fontWeight: '400', color: '#9FACB4' }}>All aggregators. All stablecoins. All at once.</span>
					</div>
					<div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
						<Button
							onClick={onOpen}
							size="sm"
							variant="ghost"
							color="white"
							_hover={{ bg: 'rgba(255, 255, 255, 0.1)' }}
							fontSize="12px"
							fontWeight="400"
							height="auto"
							padding="4px 8px"
						>
							Feedback
						</Button>
						<span style={{ fontSize: '12px', fontWeight: '400' }}>Powered by</span>
						<Link
							href="https://swap.defillama.com/?chain=ethereum&from=0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2&tab=swap"
							isExternal
							style={{ display: 'flex', alignItems: 'center', gap: '4px', textDecoration: 'none' }}
						>
							<Image src={llamaSwapIcon.src} alt="LlamaSwap" style={{ height: '16px' }} />
							<span style={{ fontSize: '12px', fontWeight: '400' }}>LlamaSwap</span>
						</Link>
					</div>
				</div>
			</FooterWrapper>

			<Modal isOpen={isOpen} onClose={onClose} size="md">
				<ModalOverlay backdropFilter="blur(8px)" bg="rgba(0, 32, 58, 0.3)" />
				<ModalContent
					bg="rgba(255, 255, 255, 0.95)"
					backdropFilter="blur(16px)"
					border="1px solid rgba(255, 255, 255, 0.8)"
					borderRadius="16px"
					boxShadow="0 8px 32px rgba(0, 32, 58, 0.15), 0 4px 16px rgba(0, 32, 58, 0.1)"
					color="#2D3748"
				>
					<ModalHeader
						bg="rgba(255, 255, 255, 0.6)"
						borderBottom="1px solid rgba(0, 32, 58, 0.1)"
						borderRadius="16px 16px 0 0"
						color="#1A202C"
						fontFamily="Urbanist"
						fontWeight="600"
					>
						Send Feedback
					</ModalHeader>
					<ModalCloseButton color="#718096" />
					<ModalBody pb={6}>
						<FeedbackForm onSubmit={handleSubmit}>
							<FormField>
								<label htmlFor="message" style={{ fontSize: '14px', fontWeight: '600', color: '#2D3748', marginBottom: '4px' }}>Your message:</label>
								<StyledTextarea
									id="message"
									name="message"
									placeholder="Tell us what you think about Nonolet..."
									required
								/>
							</FormField>
							<SubmitButton
								type="submit"
								isLoading={isSubmitting}
								loadingText="Sending..."
								disabled={isSubmitting}
							>
								Send Feedback
							</SubmitButton>
						</FeedbackForm>
					</ModalBody>
				</ModalContent>
			</Modal>
		</>
	);
}