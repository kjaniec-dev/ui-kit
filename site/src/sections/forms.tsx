import * as React from "react";
import {
  Input,
  Textarea,
  Label,
  Hint,
  Field,
  Select,
  Checkbox,
  Radio,
  Switch,
  Slider,
  Segmented,
  ToggleGroup,
  FormField,
  TextField,
  SelectField,
  ComboboxField,
  CheckboxField,
  Calendar,
  DatePickerField,
  RangeCalendar,
  DateRangePickerField,
  Dropzone,
  FileUploadField,
  type UploadItem,
  Rating,
  RatingField,
  RatingSummary,
  ColorPickerField,
  InPostGeowidgetModal,
} from "@kjaniec-dev/ui";
import { Sec, Box, Sub, Grid, IcoSearch } from "./primitives";

const codeColorPicker = `import { ColorPickerField } from "@kjaniec-dev/ui";

export function AccentColorPicker() {
  const [color, setColor] = React.useState("#3B82F6");
  return (
    <ColorPickerField
      label="Accent Color"
      hint="Used for primary buttons and interactive highlights"
      value={color}
      onChange={setColor}
    />
  );
}`;

function ColorPickerDemo() {
  const [color, setColor] = React.useState("#3B82F6");
  return (
    <div className="space-y-4 max-w-sm">
      <ColorPickerField
        label="Accent Color"
        hint="Used for primary buttons and interactive highlights"
        value={color}
        onChange={setColor}
      />
      <div className="p-3 rounded-kj-md border border-border flex items-center gap-3">
        <span className="w-6 h-6 rounded-full border border-border shrink-0" style={{ backgroundColor: color }} />
        <span className="text-xs font-mono text-muted-foreground uppercase">Active: {color}</span>
      </div>
    </div>
  );
}

export function FormsSections() {
  const [email, setEmail] = React.useState("");
  const emailOk = /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email);

  const [framework, setFramework] = React.useState("");
  const [stack, setStack] = React.useState<string[]>(["next"]);
  const frameworkOptions = [
    { value: "next", label: "Next.js" },
    { value: "remix", label: "Remix" },
    { value: "astro", label: "Astro" },
    { value: "sveltekit", label: "SvelteKit" },
    { value: "nuxt", label: "Nuxt" },
  ];

  const [meetingDate, setMeetingDate] = React.useState<Date | undefined>(undefined);
  const [inlineDate, setInlineDate] = React.useState<Date | undefined>(new Date());
  const [bookingRange, setBookingRange] = React.useState<{ start?: Date; end?: Date }>({});
  const [inlineRange, setInlineRange] = React.useState<{ start?: Date; end?: Date }>({});

  const [uploadFiles, setUploadFiles] = React.useState<UploadItem[]>([]);
  const [dropCount, setDropCount] = React.useState(0);

  React.useEffect(() => {
    if (!uploadFiles.some((it) => it.status === "pending" || it.status === "uploading")) return;
    const t = setInterval(() => {
      setUploadFiles((items) =>
        items.map((it) => {
          if (it.status === "success" || it.status === "error") return it;
          const next = (it.progress ?? 0) + 12;
          return next >= 100 ? { ...it, status: "success", progress: 100 } : { ...it, status: "uploading", progress: next };
        })
      );
    }, 400);
    return () => clearInterval(t);
  }, [uploadFiles]);

  const [seg, setSeg] = React.useState("day");
  const [format, setFormat] = React.useState<string[]>(["bold"]);

  // Rating States
  const [basicRating, setBasicRating] = React.useState(3.5);
  const [heartRating, setHeartRating] = React.useState(4);
  const [flameRating, setFlameRating] = React.useState(5);
  const [shieldRating, setShieldRating] = React.useState(3);
  const [productRating, setProductRating] = React.useState<number>(4);
  const [serviceRating, setServiceRating] = React.useState<number>(0);

  return (
    <>
      <Sec
        id="forms"
        title="Forms"
        desc="Fields with labels, leading icons, selects, textareas and live validation."
        components={[
          "Input",
          "TextField",
          "Textarea",
          "Select",
          "SelectField",
          "Combobox",
          "ComboboxField",
          "Calendar",
          "DatePicker",
          "DatePickerField",
          "RangeCalendar",
          "DateRangePicker",
          "DateRangePickerField",
          "Dropzone",
          "FileUpload",
          "FileUploadField",
          "FormField",
        ]}
      >
        <Box>
          <div className="grid gap-5" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))" }}>
            <Field>
              <Label htmlFor="full-name" required>
                Full name
              </Label>
              <Input id="full-name" placeholder="Jane Doe" />
              <Hint>This is how your team will see you.</Hint>
            </Field>
            <Field>
              <Label htmlFor="email" required>
                E-mail
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="jane@company.com"
                value={email}
                error={email.length > 0 && !emailOk}
                onChange={(e) => setEmail(e.target.value)}
              />
              <Hint error={email.length > 0 && !emailOk}>
                {!email ? "We'll use it to sign you in." : emailOk ? "Looks good ✓" : "Enter a valid email address."}
              </Hint>
            </Field>
            <Field>
              <Label htmlFor="search">Search</Label>
              <Input id="search" leadingIcon={IcoSearch} placeholder="Search projects…" />
            </Field>
            <Field>
              <Label htmlFor="role">Role</Label>
              <Select id="role">
                <option>Administrator</option>
                <option>Editor</option>
                <option>View only</option>
              </Select>
            </Field>
            <Field style={{ gridColumn: "1/-1" }}>
              <Label htmlFor="project-desc">Project description</Label>
              <Textarea id="project-desc" placeholder="What is this project about?" />
            </Field>
            <Field>
              <Label htmlFor="disabled-field">Disabled field</Label>
              <Input id="disabled-field" value="workspace-id-8842" disabled readOnly />
            </Field>
            <Field>
              <Label htmlFor="error-field">Field with error</Label>
              <Input id="error-field" value="not-ok" error readOnly />
              <Hint error>Only lowercase letters and hyphens are allowed.</Hint>
            </Field>
          </div>
        </Box>
        <Box>
          <Sub>FormField (Unified wrapper)</Sub>
          <div className="grid gap-5" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))" }}>
            <FormField
              label="Email address"
              required
              hint="We'll use it to sign you in."
              error={email.length > 0 && !emailOk ? "Enter a valid email address." : undefined}
            >
              <Input
                type="email"
                placeholder="jane@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </FormField>
            <FormField label="Target Workspace">
              <Select>
                <option>B2B SaaS Portal</option>
                <option>Developer Dashboard</option>
                <option>Portfolio Site</option>
              </Select>
            </FormField>
          </div>
        </Box>
        <Box>
          <Sub>Convenient Field Components (v0.7.0)</Sub>
          <div className="grid gap-5" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))" }}>
            <TextField
              label="E-mail"
              required
              placeholder="jane@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={email.length > 0 && !emailOk ? "Enter a valid email address." : undefined}
              hint="We'll use it to sign you in."
            />
            <SelectField label="Subscription Status" defaultValue="active">
              <option value="active">Active</option>
              <option value="trial">Trial</option>
              <option value="past_due">Past Due</option>
            </SelectField>
            <div className="flex items-center pt-5">
              <CheckboxField
                label="Accept terms & conditions"
                hint="You must agree to continue."
                defaultChecked
              />
            </div>
          </div>
        </Box>
        <Box>
          <Sub>Combobox (searchable select)</Sub>
          <div className="grid gap-5" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))" }}>
            <ComboboxField
              label="Primary framework"
              hint="Type to filter the list."
              options={frameworkOptions}
              value={framework}
              onChange={setFramework}
              placeholder="Select a framework…"
            />
            <ComboboxField
              label="Your stack"
              hint="Pick as many as you like."
              multiple
              options={frameworkOptions}
              value={stack}
              onChange={setStack}
              placeholder="Add frameworks…"
            />
          </div>
        </Box>
        <Box>
          <Sub>DatePicker / Calendar</Sub>
          <div className="grid gap-5" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))" }}>
            <DatePickerField
              label="Meeting date"
              hint="Weekends are disabled."
              value={meetingDate}
              onChange={setMeetingDate}
              disabledDates={(d) => d.getDay() === 0 || d.getDay() === 6}
            />
            <div>
              <Sub>Calendar (standalone)</Sub>
              <Calendar value={inlineDate} onChange={setInlineDate} />
            </div>
          </div>
        </Box>
        <Box>
          <Sub>DateRangePicker / RangeCalendar</Sub>
          <div className="grid gap-5" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))" }}>
            <DateRangePickerField
              label="Booking dates"
              hint="Weekends are disabled."
              value={bookingRange}
              onChange={setBookingRange}
              disabledDates={(d) => d.getDay() === 0 || d.getDay() === 6}
            />
          </div>
          <div className="mt-5">
            <Sub>RangeCalendar (standalone)</Sub>
            <RangeCalendar value={inlineRange} onChange={setInlineRange} />
          </div>
        </Box>
        <Box>
          <Sub>FileUpload / Dropzone</Sub>
          <div className="grid gap-5" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))" }}>
            <FileUploadField
              label="Attachments"
              hint="PDF or images, up to 5 MB each. Uploads are simulated."
              accept="image/*,.pdf"
              maxSize={5 * 1024 * 1024}
              value={uploadFiles}
              onChange={setUploadFiles}
            />
          </div>
          <div className="mt-5">
            <Sub>Dropzone (standalone)</Sub>
            <Dropzone onFiles={(files) => setDropCount((c) => c + files.length)} />
            <p className="mt-2 text-sm text-muted-foreground">{dropCount} file(s) received</p>
          </div>
        </Box>
      </Sec>

      <Sec
        id="selection"
        title="Selection controls"
        desc="Checkboxes, radios, switches, a slider, a segmented control and a multi-select toggle group."
        components={["Checkbox", "CheckboxField", "Radio", "Switch", "Slider", "Segmented", "ToggleGroup"]}
      >
        <Grid>
          <Box className="mb-0">
            <Sub>Checkbox & radio</Sub>
            <div className="flex flex-col gap-3">
              <Checkbox defaultChecked label="Email notifications" />
              <Checkbox label="Weekly report" />
              <div className="h-px bg-border my-1" />
              <Radio name="plan" defaultChecked label="Monthly plan" />
              <Radio name="plan" label="Annual plan" />
            </div>
          </Box>
          <Box className="mb-0">
            <Sub>Switches, slider, segments</Sub>
            <div className="flex flex-col gap-4">
              <Switch defaultChecked label="Dark mode for new users" />
              <Switch label="Automatic backups" />
              <Field>
                <Label htmlFor="volume-field">Volume</Label>
                <Slider id="volume-field" min={0} max={100} defaultValue={65} />
              </Field>
              <Segmented
                value={seg}
                onChange={setSeg}
                options={[
                  { value: "day", label: "Day" },
                  { value: "week", label: "Week" },
                  { value: "month", label: "Month" },
                ]}
              />
              <ToggleGroup
                value={format}
                onChange={setFormat}
                aria-label="Text formatting"
                options={[
                  { value: "bold", label: <strong>B</strong> },
                  { value: "italic", label: <em>I</em> },
                  { value: "underline", label: <span className="underline">U</span> },
                ]}
              />
            </div>
          </Box>
        </Grid>
      </Sec>

      <Sec
        id="rating"
        title="Rating"
        desc="Star and custom icon ratings, rating form fields, and score summary cards."
        components={["Rating", "RatingField", "RatingSummary"]}
      >
        <Box>
          <Sub>Interactive &amp; Sizes</Sub>
          <div className="flex flex-wrap items-center gap-6">
            <div className="flex flex-col gap-1.5">
              <span className="text-xs text-muted-foreground font-medium">Small (sm)</span>
              <Rating size="sm" defaultValue={4} showValue />
            </div>
            <div className="flex flex-col gap-1.5">
              <span className="text-xs text-muted-foreground font-medium">Medium (md)</span>
              <Rating size="md" value={basicRating} onChange={setBasicRating} showValue />
            </div>
            <div className="flex flex-col gap-1.5">
              <span className="text-xs text-muted-foreground font-medium">Large (lg)</span>
              <Rating size="lg" defaultValue={4.5} precision={0.5} showValue />
            </div>
            <div className="flex flex-col gap-1.5">
              <span className="text-xs text-muted-foreground font-medium">Extra Large (xl)</span>
              <Rating size="xl" defaultValue={5} showValue />
            </div>
          </div>
          <div className="h-px bg-border my-5" />
          <Sub>Custom Icons &amp; Color Variants</Sub>
          <div className="flex flex-wrap items-center gap-6">
            <div className="flex flex-col gap-1.5">
              <span className="text-xs text-muted-foreground font-medium">Hearts (Red)</span>
              <Rating icon="heart" color="#ef4444" value={heartRating} onChange={setHeartRating} showValue />
            </div>
            <div className="flex flex-col gap-1.5">
              <span className="text-xs text-muted-foreground font-medium">Flames (Orange)</span>
              <Rating icon="flame" color="#f97316" value={flameRating} onChange={setFlameRating} showValue />
            </div>
            <div className="flex flex-col gap-1.5">
              <span className="text-xs text-muted-foreground font-medium">Shields (Blue)</span>
              <Rating icon="shield" color="#3b82f6" value={shieldRating} onChange={setShieldRating} showValue />
            </div>
          </div>
          <div className="h-px bg-border my-5" />
          <Sub>States (Read-only &amp; Disabled)</Sub>
          <div className="flex flex-wrap items-center gap-6">
            <div className="flex flex-col gap-1.5">
              <span className="text-xs text-muted-foreground font-medium font-mono">readOnly (4.8 / 5)</span>
              <Rating readOnly value={4.8} showValue showCount count={128} />
            </div>
            <div className="flex flex-col gap-1.5">
              <span className="text-xs text-muted-foreground font-medium font-mono">disabled</span>
              <Rating disabled value={3} showValue />
            </div>
          </div>
        </Box>

        <Box>
          <Sub>RatingField Form Integration</Sub>
          <div className="grid gap-6 md:grid-cols-2">
            <RatingField
              label="Product Satisfaction"
              helperText="Please rate your experience with our platform."
              value={productRating}
              onChange={setProductRating}
              required
              showValue
            />
            <RatingField
              label="Service Quality"
              errorMessage={serviceRating === 0 ? "Rating is required before submitting feedback." : undefined}
              value={serviceRating}
              onChange={setServiceRating}
              required
              showValue
            />
          </div>
        </Box>

        <Box>
          <Sub>RatingSummary Card</Sub>
          <RatingSummary
            average={4.6}
            totalCount={1248}
            distribution={[
              { stars: 5, count: 850, percentage: 68 },
              { stars: 4, count: 240, percentage: 19 },
              { stars: 3, count: 98, percentage: 8 },
              { stars: 2, count: 35, percentage: 3 },
              { stars: 1, count: 25, percentage: 2 },
            ]}
          />
        </Box>
      </Sec>

      <Sec
        id="color-picker"
        title="ColorPicker"
        desc="Swatch-triggered color picker popover with preset swatches, Hue slider, and Hex input."
        components={["ColorPicker", "ColorPickerField", "ColorPickerSwatch"]}
        code={codeColorPicker}
      >
        <Box>
          <ColorPickerDemo />
        </Box>
      </Sec>

      <Sec
        id="inpost-geowidget"
        title="InPost GeoWidget"
        desc="Modern React wrapper for InPost GeoWidget v5 map & modal parcel locker picker with auto script loading."
        components={["InPostGeowidget", "InPostGeowidgetModal"]}
        code={`import { InPostGeowidgetModal } from "@kjaniec-dev/ui";

export function InPostCheckout() {
  const [point, setPoint] = React.useState(null);
  return (
    <InPostGeowidgetModal
      sandbox={true}
      value={point}
      onSelect={(p) => setPoint(p)}
      buttonVariant="primary"
      triggerText="Wybierz punkt Paczkomat®"
    />
  );
}`}
      >
        <Box>
          <Sub>InPost Geowidget Modal Picker</Sub>
          <p className="text-sm text-muted-foreground mb-4">
            Kliknij przycisk poniżej, aby otworzyć interaktywny modal z mapą punktów odbioru Paczkomat®.
          </p>
          <div className="flex flex-wrap items-center gap-4">
            <InPostGeowidgetModal
              sandbox={true}
              buttonVariant="outline"
              buttonSize="md"
              triggerText="Wybierz punkt Paczkomat®"
            />
            <InPostGeowidgetModal
              sandbox={true}
              buttonVariant="primary"
              buttonSize="md"
              triggerText="Dostawa InPost (Design Kit)"
            />
          </div>
        </Box>
      </Sec>
    </>
  );
}
