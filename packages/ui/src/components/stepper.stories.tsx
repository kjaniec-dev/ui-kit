import type { Meta, StoryObj } from "@storybook/react";
import * as React from "react";
import {
  Stepper,
  StepperList,
  StepperItem,
  StepperTrigger,
  StepperIndicator,
  StepperTitle,
  StepperDescription,
  StepperSeparator,
  StepperContent,
  useStepper,
} from "./stepper";
import { Button } from "./button";

const meta: Meta<typeof Stepper> = {
  title: "Components/Stepper",
  component: Stepper,
};

export default meta;
type Story = StoryObj<typeof Stepper>;

export const Horizontal: Story = {
  render: () => {
    const stepper = useStepper({ stepsCount: 3 });
    return (
      <div className="max-w-2xl mx-auto p-6 bg-zinc-950 rounded-xl border border-zinc-800 text-zinc-100 space-y-6">
        <Stepper value={stepper.activeStep} onValueChange={stepper.setStep}>
          <StepperList>
            <StepperItem value={0}>
              <StepperTrigger>
                <StepperIndicator />
                <div className="flex flex-col">
                  <StepperTitle>Profile</StepperTitle>
                  <StepperDescription>User details</StepperDescription>
                </div>
              </StepperTrigger>
            </StepperItem>
            <StepperSeparator />
            <StepperItem value={1}>
              <StepperTrigger>
                <StepperIndicator />
                <div className="flex flex-col">
                  <StepperTitle>Billing</StepperTitle>
                  <StepperDescription>Card info</StepperDescription>
                </div>
              </StepperTrigger>
            </StepperItem>
            <StepperSeparator />
            <StepperItem value={2}>
              <StepperTrigger>
                <StepperIndicator />
                <div className="flex flex-col">
                  <StepperTitle>Review</StepperTitle>
                  <StepperDescription>Confirm</StepperDescription>
                </div>
              </StepperTrigger>
            </StepperItem>
          </StepperList>

          <div className="p-4 bg-zinc-900 border border-zinc-800 rounded-lg min-h-[100px]">
            <StepperContent value={0}>
              <p>Step 1 Form Content: Please input username.</p>
            </StepperContent>
            <StepperContent value={1}>
              <p>Step 2 Form Content: Enter credit card details.</p>
            </StepperContent>
            <StepperContent value={2}>
              <p>Step 3 Form Content: Review and click Submit.</p>
            </StepperContent>
          </div>

          <div className="flex justify-between">
            <Button variant="secondary" onClick={stepper.prevStep} disabled={stepper.isFirstStep}>
              Back
            </Button>
            <Button onClick={stepper.isLastStep ? () => alert("Done") : stepper.nextStep}>
              {stepper.isLastStep ? "Submit" : "Next"}
            </Button>
          </div>
        </Stepper>
      </div>
    );
  },
};

export const Vertical: Story = {
  render: () => {
    const stepper = useStepper({ stepsCount: 3 });
    return (
      <div className="max-w-md mx-auto p-6 bg-zinc-950 rounded-xl border border-zinc-800 text-zinc-100">
        <Stepper value={stepper.activeStep} onValueChange={stepper.setStep} orientation="vertical">
          <StepperList>
            <StepperItem value={0}>
              <StepperTrigger>
                <StepperIndicator />
                <div className="flex flex-col">
                  <StepperTitle>Account Details</StepperTitle>
                  <StepperDescription>Set credentials</StepperDescription>
                </div>
              </StepperTrigger>
            </StepperItem>
            <StepperSeparator />
            <StepperItem value={1}>
              <StepperTrigger>
                <StepperIndicator />
                <div className="flex flex-col">
                  <StepperTitle>Address info</StepperTitle>
                  <StepperDescription>Delivery details</StepperDescription>
                </div>
              </StepperTrigger>
            </StepperItem>
            <StepperSeparator />
            <StepperItem value={2}>
              <StepperTrigger>
                <StepperIndicator />
                <div className="flex flex-col">
                  <StepperTitle>Overview</StepperTitle>
                  <StepperDescription>Final details</StepperDescription>
                </div>
              </StepperTrigger>
            </StepperItem>
          </StepperList>
        </Stepper>
      </div>
    );
  },
};
