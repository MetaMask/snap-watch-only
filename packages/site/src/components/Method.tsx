import Grid from '@mui/material/Grid';
import React from 'react';
import styled from 'styled-components';

import { InputType } from '../types';
import { MethodButton } from './Buttons';

const StyledDescription = styled.p`
  font-size: 14px;
  margin: 8px;
  padding-top: 24px;
`;

const InputTitle = styled.p`
  font-size: 14px;
  font-weight: bold;
  margin: 5px 2.5% 5px 16px;
`;

const StyledSelect = styled.select`
  width: calc(95% - 16px);
  padding-top: 8px;
  padding-bottom: 10px;
  margin: 8px 2.5% 8px 16px;
  border-radius: 5px;
`;

const StyledSelectItem = styled.option`
  margin-left: 16px;

  :disabled {
    font-style: italic;
  }
`;

const TextField = styled.input`
  width: calc(95% - 16px);
  padding: 10px;
  margin: 8px 2.5% 8px 16px;
  background: transparent;
  border-radius: 5px;
  box-sizing: border-box;
  border: 1px solid ${(props) => props.theme.colors.border?.default};
  color: ${(props) => props.theme.colors.text?.default};
`;

export type MethodProps = {
  description: string;
  inputs: {
    id: string;
    title: string;
    placeholder: string;
    onChange: () => null;
    type: InputType;
  }[];
  action: {
    callback: () => Promise<unknown>;
    disabled: boolean;
    label: string;
  };
  successMessage?: string;
  failureMessage?: string;
};

export const Method = ({ description, inputs, action }: MethodProps) => {
  const inputSwitch = (props: any) => {
    switch (props.type) {
      case InputType.TextField:
        return (
          <TextField
            id={props.id}
            placeholder={props.placeholder}
            onChange={props.onChange}
          />
        );
      case InputType.Dropdown:
        return (
          <StyledSelect onChange={props.onChange}>
            <StyledSelectItem disabled value="">
              {props.placeholder}
            </StyledSelectItem>
            {props.options.map((option: { value: string | number }) => (
              <StyledSelectItem value={option.value} key={option.value}>
                {option.value}
              </StyledSelectItem>
            ))}
          </StyledSelect>
        );
      default:
        return null;
    }
  };

  return (
    <Grid
      container
      direction="column"
      spacing={4}
      style={{
        overflowX: 'hidden',
      }}
    >
      <StyledDescription>{description}</StyledDescription>
      {inputs?.map(
        (input: {
          title: string;
          placeholder: string;
          onChange: () => null;
          type: InputType;
        }) => (
          <Grid key={input.title}>
            <InputTitle>{input.title}</InputTitle>
            {inputSwitch(input)}
          </Grid>
        ),
      )}

      {action && (
        <MethodButton
          onClick={async () => {
            try {
              // eslint-disable-next-line id-length
              await action.callback();
              // eslint-disable-next-line id-length
            } catch (e: any) {
              console.error(e);
            }
          }}
          disable={action.disabled}
          label={action.label}
        />
      )}
    </Grid>
  );
};
