import Select, { Props } from 'react-select';
import styled from 'styled-components';
import { QuestionIcon } from '@chakra-ui/icons';
import { CSSProperties } from 'react';

interface IReactSelect extends Props {
	style?: CSSProperties;
	defaultOptions?: boolean;
	itemCount?: number;
	cacheOptions?: boolean;
}

const formatOptionLabel = ({ label, ...rest }) => {
	return (
		<div style={{ display: 'flex' }}>
			<div style={{ color: '#ccc' }}>
				{rest.logoURI ? (
					<img
						src={rest.logoURI}
						style={{
							minWidth: '20px',
							minHeight: '20px',
							width: '20px',
							height: '20px',
							marginRight: 8,
							borderRadius: '50%',
							aspectRatio: 1
						}}
						alt=""
					/>
				) : rest?.logoURI === false ? null : (
					<QuestionIcon height="20px" width="20px" marginRight={'8px'} />
				)}
			</div>
			<div>{label}</div>
		</div>
	);
};

const Wrapper = styled.span`
	--background: ${({ theme }) => theme.white};
	--menu-background: ${({ theme }) => theme.white};
	--color: ${({ theme }) => theme.text1};
	--placeholder: ${({ theme }) => theme.text3};
	--bg-hover: ${({ theme }) => theme.text2};
	--option-bg: ${({ theme }) => theme.text1};

	& > * > * {
		border-radius: 12px;
	}
	@media screen and (max-width: ${({ theme }) => theme.bpMed}) {
		font-size: 16px;
	}
`;

const customStyles = {
	control: (provided) => ({
		...provided,
		background: 'var(--background)',
		padding: '8px',
		borderRadius: '12px',
		border: '1px solid #EAEDEF',
		color: 'var(--color)',
		margin: 0,
		zIndex: 0
	}),
	input: (provided) => ({
		...provided,
		color: 'var(--color)'
	}),
	menu: (provided) => ({
		...provided,
		background: 'var(--menu-background)',
		zIndex: 10
	}),
	menuList: (provided) => ({
		...provided,
		'scrollbar-width': 'none',
		'-ms-overflow-style': 'none',
		'&::-webkit-scrollbar': {
			display: 'none'
		}
	}),
	option: (provided, state) => ({
		...provided,
		color: state.isActive ? 'black' : 'var(--color)'
	}),
	multiValue: (provided) => ({
		...provided,
		fontFamily: 'inherit',
		background: 'var(--option-bg)',
		padding: '2px'
	}),
	multiValueLabel: (styles) => ({
		...styles,
		color: 'var(--color)'
	}),
	placeholder: (provided) => ({
		...provided,
		color: 'var(--placeholder)'
	}),
	singleValue: (provided, state) => ({
		...provided,
		color: 'var(--color)'
	})
};

const ReactSelect = ({ options, style, ...props }: IReactSelect) => (
	<Wrapper style={style}>
		<Select
			styles={{ ...customStyles }}
			options={options}
			theme={(theme) => {
				return {
					...theme,
					colors: {
						...theme.colors,
						primary25: 'var(--bg-hover)',
						primary50: 'var(--bg-hover)',
						primary75: 'var(--bg-hover)'
					}
				};
			}}
			formatOptionLabel={(props.defaultOptions ? undefined : formatOptionLabel) as any}
			{...props}
		/>
	</Wrapper>
);

export default ReactSelect;
