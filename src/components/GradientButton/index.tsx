import React from 'react';
import { Button, ButtonProps } from '@chakra-ui/react';

interface GradientButtonProps extends ButtonProps {
  variant?: 'primary' | 'secondary' | 'outline';
  gradientColors?: [string, string];
}

const GradientButton: React.FC<GradientButtonProps> = ({ 
  variant = 'primary', 
  gradientColors = ['#00203A', '#3793FF'],
  children, 
  ...props 
}) => {
  const getButtonStyles = () => {
    switch (variant) {
      case 'primary':
        return {
          bg: `linear-gradient(90deg, ${gradientColors[0]} 0%, ${gradientColors[1]} 100%)`,
          color: 'white',
          borderRadius: '50px',
          padding: '30px',
          fontWeight: 'base',
          _hover: {
            bg: `linear-gradient(90deg, ${gradientColors[0]} 0%, ${gradientColors[1]} 100%)`,
            opacity: 0.9,
          },
          _active: {
            bg: `linear-gradient(90deg, ${gradientColors[0]} 0%, ${gradientColors[1]} 100%)`,
            opacity: 0.8,
          },
          _disabled: {
            bg: `linear-gradient(90deg, ${gradientColors[0]} 0%, ${gradientColors[1]} 100%)`,
            opacity: 0.6,
          }
        };
      case 'secondary':
        return {
          bg: `linear-gradient(90deg, ${gradientColors[1]} 0%, ${gradientColors[0]} 100%)`,
          color: 'white',
          borderRadius: '50px',
          padding: '30px',
          fontWeight: 'base',
          _hover: {
            bg: `linear-gradient(90deg, ${gradientColors[1]} 0%, ${gradientColors[0]} 100%)`,
            opacity: 0.9,
          },
          _active: {
            bg: `linear-gradient(90deg, ${gradientColors[1]} 0%, ${gradientColors[0]} 100%)`,
            opacity: 0.8,
          },
          _disabled: {
            bg: `linear-gradient(90deg, ${gradientColors[1]} 0%, ${gradientColors[0]} 100%)`,
            opacity: 0.6,
          }
        };
      case 'outline':
        return {
          bg: 'transparent',
          color: gradientColors[1],
          borderRadius: '50px',
          padding: '30px',
          fontWeight: 'base',
          border: '2px solid',
          borderColor: gradientColors[1],
          _hover: {
            bg: `linear-gradient(90deg, ${gradientColors[0]} 0%, ${gradientColors[1]} 100%)`,
            color: 'white',
          },
          _active: {
            bg: `linear-gradient(90deg, ${gradientColors[0]} 0%, ${gradientColors[1]} 100%)`,
            color: 'white',
            opacity: 0.8,
          }
        };
      default:
        return {};
    }
  };

  return (
    <Button
      {...getButtonStyles()}
      {...props}
    >
      {children}
    </Button>
  );
};

export default GradientButton; 