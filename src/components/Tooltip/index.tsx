import * as React from 'react'
import styled from 'styled-components'
import { Tooltip as AriaTooltip, TooltipAnchor, useTooltipState } from 'ariakit/tooltip'
import Link from 'next/link'

interface ITooltip {
	content: string | null | React.ReactNode
	href?: string
	shallow?: boolean
	onClick?: (e: any) => any
	style?: {}
	children: React.ReactNode
	as?: any
}

const TooltipPopver = styled(AriaTooltip)`
	font-size: 0.85rem;
	padding: 1rem;
	color: hsl(220, 9%, 46%);
	background: rgba(255, 255, 255, 0.85);
	backdrop-filter: blur(16px);
	-webkit-backdrop-filter: blur(16px);
	border: 1px solid rgba(255, 255, 255, 0.3);
	border-radius: 12px;
	box-shadow: 
		0 8px 32px rgba(0, 0, 0, 0.08),
		0 4px 16px rgba(0, 0, 0, 0.04),
		inset 0 1px 0 rgba(255, 255, 255, 0.6);
	max-width: 228px;
	position: relative;
	z-index: 1000;
	
	&::before {
		content: '';
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: linear-gradient(135deg, 
			rgba(255, 255, 255, 0.1) 0%, 
			rgba(255, 255, 255, 0.05) 50%, 
			rgba(255, 255, 255, 0.1) 100%);
		border-radius: inherit;
		pointer-events: none;
		z-index: -1;
	}
	
	strong {
		color: hsl(220, 15%, 20%);
		font-weight: 600;
	}
	
	br + br {
		line-height: 0.4;
	}
`;

const TooltipAnchor2 = styled(TooltipAnchor)`
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
	flex-shrink: 0;

	a {
		display: flex;
	}
`;

const Popover2 = styled(TooltipPopver)`
	padding: 12px;
`;

export default function Tooltip({ content, as, href, shallow, onClick, children, ...props }: ITooltip) {
	const tooltip = useTooltipState()

	if (!content || content === '') return <>{children}</>

	const triggerProps = {
		...(onClick && { onClick })
	}

	return (
		<>
			<TooltipAnchor state={tooltip} as={as || (href ? 'div' : 'button')} className="tooltip-trigger" {...triggerProps}>
				{href ? (
					<Link href={href} shallow={shallow} passHref>
						<a>{children}</a>
					</Link>
				) : (
					children
				)}
			</TooltipAnchor>
			<TooltipPopver state={tooltip} {...props}>
				{content}
			</TooltipPopver>
		</>
	)
}

export function Tooltip2({ content, children, ...props }: ITooltip) {
	const tooltip = useTooltipState()

	if (!content || content === '') return <>{children}</>

	return (
		<>
			<TooltipAnchor2 state={tooltip}>{children}</TooltipAnchor2>
			<Popover2 state={tooltip} {...props}>
				{content}
			</Popover2>
		</>
	)
}