import type { Meta } from "@storybook/react";
import { DetailPageLayout } from "./detail-page-layout";
import { Card } from "./card";
import { Button } from "./button";
import { Badge } from "./badge";

const meta = {
  title: "Layout/DetailPageLayout",
  component: DetailPageLayout,
} satisfies Meta<typeof DetailPageLayout>;

export default meta;

export const Default = {
  render: () => (
    <DetailPageLayout
      title="Transaction #TRN-9022"
      description="Captured via Stripe checkout flow."
      backLabel="Back to payments"
      onBackClick={() => alert("Back")}
      actions={
        <>
          <Button variant="outline" size="sm">Refund</Button>
          <Button size="sm">Receipt</Button>
        </>
      }
      aside={
        <div className="space-y-4 text-sm">
          <h4 className="font-bold">Payment Details</h4>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Status</span>
            <Badge variant="success">Paid</Badge>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Amount</span>
            <span className="font-bold font-mono">$1,450.00</span>
          </div>
        </div>
      }
    >
      <Card className="p-6">
        <h3 className="text-base font-bold mb-3">Billing Address</h3>
        <p className="text-sm text-muted-foreground leading-relaxed">
          John Doe<br />
          ul. Marszałkowska 10/24<br />
          00-001 Warszawa, Poland
        </p>
      </Card>
    </DetailPageLayout>
  ),
};
