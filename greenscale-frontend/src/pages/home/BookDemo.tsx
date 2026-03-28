import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Calendar as CalendarIcon,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock,
  Mail,
  ShieldCheck,
} from "lucide-react";
import { MarketingNavbar } from "@/components/marketing/MarketingNavbar";
import Footer from "./Footer";

const timeSlots = [
  "09:00",
  "09:30",
  "10:00",
  "10:30",
  "11:00",
  "11:30",
  "13:00",
  "13:30",
  "14:00",
  "14:30",
  "15:00",
  "15:30",
  "16:00",
  "16:30",
  "17:00",
];

const monthNames = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

type Step = "calendar" | "form" | "success";

type DemoForm = {
  firstName: string;
  lastName: string;
  email: string;
  company: string;
  role: string;
  message: string;
};

type DemoErrors = Partial<Record<keyof DemoForm, string>>;

function getDaysInMonth(year: number, monthIndex: number) {
  return new Date(year, monthIndex + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, monthIndex: number) {
  return new Date(year, monthIndex, 1).getDay();
}

function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function StepDots({ step }: { step: Step }) {
  const dotClass = "h-2 rounded-full transition-all";
  return (
    <div className="flex items-center justify-center gap-2">
      <span
        className={cn(
          dotClass,
          step === "calendar" ? "w-6 bg-green-600" : "w-2 bg-green-600"
        )}
      />
      <span
        className={cn(
          dotClass,
          step === "form"
            ? "w-6 bg-green-600"
            : step === "success"
              ? "w-2 bg-green-500"
              : "w-2 bg-muted-foreground/50"
        )}
      />
      <span
        className={cn(
          dotClass,
          step === "success" ? "w-6 bg-green-600" : "w-2 bg-muted-foreground/50"
        )}
      />
    </div>
  );
}

export function BookDemo() {
  const today = useMemo(() => {
    const t = new Date();
    t.setHours(0, 0, 0, 0);
    return t;
  }, []);

  const [step, setStep] = useState<Step>("calendar");
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [selectedDate, setSelectedDate] = useState<number | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);

  const [sending, setSending] = useState(false);
  const [form, setForm] = useState<DemoForm>({
    firstName: "",
    lastName: "",
    email: "",
    company: "",
    role: "",
    message: "",
  });
  const [errors, setErrors] = useState<DemoErrors>({});

  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDay = getFirstDayOfMonth(currentYear, currentMonth);

  const selectedDateObj = useMemo(() => {
    if (!selectedDate) return null;
    return new Date(currentYear, currentMonth, selectedDate);
  }, [currentYear, currentMonth, selectedDate]);

  const prevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
    setSelectedDate(null);
    setSelectedTime(null);
  };

  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
    setSelectedDate(null);
    setSelectedTime(null);
  };

  const isPast = (day: number) => {
    const d = new Date(currentYear, currentMonth, day);
    d.setHours(0, 0, 0, 0);
    return d < today;
  };

  const isWeekend = (day: number) => {
    const dow = new Date(currentYear, currentMonth, day).getDay();
    return dow === 0 || dow === 6;
  };

  const validate = () => {
    const nextErrors: DemoErrors = {};
    if (!form.firstName.trim()) nextErrors.firstName = "Required";
    if (!form.lastName.trim()) nextErrors.lastName = "Required";
    if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email)) {
      nextErrors.email = "Valid email required";
    }
    if (!form.company.trim()) nextErrors.company = "Required";
    if (!form.role.trim()) nextErrors.role = "Required";
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSending(true);
    await new Promise((r) => setTimeout(r, 1200));
    setSending(false);
    setStep("success");
  };

  const reset = () => {
    setStep("calendar");
    setSelectedDate(null);
    setSelectedTime(null);
    setErrors({});
    setSending(false);
    setForm({
      firstName: "",
      lastName: "",
      email: "",
      company: "",
      role: "",
      message: "",
    });
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
        <MarketingNavbar variant="dark" />
      <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center animate-in">
          <div className="inline-flex items-center gap-2 rounded-full border bg-card px-4 py-2 text-xs font-semibold text-green-700">
            <span className="h-2 w-2 rounded-full bg-green-600" />
            Live Demo Available
          </div>

          <h1 className="mt-6 text-4xl font-extrabold tracking-tight sm:text-5xl">
            Book Your <span className="text-green-600">Personal Demo</span>
          </h1>
          <p className="mt-4 text-base text-muted-foreground sm:text-lg">
            30-minute session, tailored to your needs.
          </p>

          <div className="mt-8">
            <StepDots step={step} />
          </div>
        </div>

        {step === "calendar" && (
          <div className="mt-10 grid gap-6 lg:grid-cols-2 animate-in">
            <Card className="shadow-sm">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <Button variant="outline" size="icon" onClick={prevMonth} aria-label="Previous month">
                    <ChevronLeft />
                  </Button>
                  <div className="text-sm font-semibold">
                    {monthNames[currentMonth]} {currentYear}
                  </div>
                  <Button variant="outline" size="icon" onClick={nextMonth} aria-label="Next month">
                    <ChevronRight />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-7 gap-1">
                  {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d) => (
                    <div
                      key={d}
                      className="pb-1 text-center text-[11px] font-semibold tracking-wide text-muted-foreground"
                    >
                      {d}
                    </div>
                  ))}
                </div>

                <div className="mt-2 grid grid-cols-7 gap-1">
                  {Array.from({ length: firstDay }, (_, i) => (
                    <div key={`e-${i}`} />
                  ))}

                  {Array.from({ length: daysInMonth }, (_, i) => {
                    const day = i + 1;
                    const disabled = isPast(day) || isWeekend(day);
                    const dateObj = new Date(currentYear, currentMonth, day);
                    dateObj.setHours(0, 0, 0, 0);

                    const selected = selectedDate === day;
                    const isToday = isSameDay(dateObj, today);

                    return (
                      <button
                        key={day}
                        type="button"
                        disabled={disabled}
                        onClick={() => setSelectedDate(day)}
                        className={cn(
                          "h-10 w-10 rounded-md text-sm transition",
                          "flex items-center justify-center",
                          disabled && "cursor-not-allowed opacity-40",
                          selected
                            ? "bg-green-600 text-white"
                            : "hover:bg-green-50 hover:text-green-700",
                          isToday && !selected && "border border-green-600 text-green-700"
                        )}
                      >
                        {day}
                      </button>
                    );
                  })}
                </div>

                <div className="mt-6 rounded-lg border bg-green-50 p-4">
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 rounded-md bg-white p-2 text-green-700">
                      <Clock className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold">30-minute session</div>
                      <div className="text-sm text-muted-foreground">
                        Video call · Google Meet or Zoom
                      </div>
                    </div>
                  </div>
                </div>

                <p className="mt-3 text-xs text-muted-foreground">
                  Weekends and past dates are disabled.
                </p>
              </CardContent>
            </Card>

            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle className="text-base">Available Times</CardTitle>
                <div className="text-sm text-muted-foreground">
                  {selectedDateObj
                    ? `${monthNames[currentMonth]} ${selectedDate}, ${currentYear}`
                    : "Select a date to see times"}
                </div>
              </CardHeader>
              <CardContent>
                {!selectedDate ? (
                  <div className="rounded-lg border bg-card p-8 text-center text-muted-foreground">
                    <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-green-50 text-green-700">
                      <CalendarIcon className="h-5 w-5" />
                    </div>
                    <div className="text-sm">Pick a date to view available times.</div>
                  </div>
                ) : (
                  <>
                    <div className="flex flex-wrap gap-2">
                      {timeSlots.map((t) => (
                        <button
                          key={t}
                          type="button"
                          onClick={() => setSelectedTime(t)}
                          className={cn(
                            "rounded-md border px-3 py-2 text-sm transition",
                            selectedTime === t
                              ? "border-green-600 bg-green-600 text-white"
                              : "bg-card hover:border-green-600 hover:text-green-700"
                          )}
                        >
                          {t}
                        </button>
                      ))}
                    </div>

                    <div className="mt-6">
                      <div className="rounded-lg border bg-card p-4">
                        <div className="text-xs font-semibold text-muted-foreground">SELECTED SLOT</div>
                        <div className="mt-1 text-sm font-semibold">
                          {selectedTime
                            ? `${monthNames[currentMonth]} ${selectedDate} · ${selectedTime}`
                            : "Choose a time"}
                        </div>
                      </div>

                      <Button
                        className="mt-4 w-full bg-green-600 text-white hover:bg-green-700"
                        disabled={!selectedTime}
                        onClick={() => setStep("form")}
                      >
                        Continue
                      </Button>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {step === "form" && (
          <div className="mx-auto mt-10 max-w-2xl animate-in">
            <div className="mb-6 flex items-center justify-between rounded-lg border bg-green-50 p-4">
              <div className="flex items-center gap-3">
                <div className="rounded-md bg-white p-2 text-green-700">
                  <CalendarIcon className="h-4 w-4" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-muted-foreground">Your slot</div>
                  <div className="text-sm font-semibold">
                    {selectedDate && selectedTime
                      ? `${monthNames[currentMonth]} ${selectedDate} · ${selectedTime}`
                      : "Not selected"}
                  </div>
                </div>
              </div>
              <Button variant="link" onClick={() => setStep("calendar")}>
                Change
              </Button>
            </div>

            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle>Your Details</CardTitle>
                <div className="text-sm text-muted-foreground">
                  We’ll send confirmation to your email.
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First name *</Label>
                    <Input
                      id="firstName"
                      value={form.firstName}
                      onChange={(e) => setForm((f) => ({ ...f, firstName: e.target.value }))}
                      className={cn(errors.firstName && "border-red-500 focus-visible:ring-red-500")}
                      placeholder="Jane"
                    />
                    {errors.firstName && (
                      <div className="text-xs text-red-600">{errors.firstName}</div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last name *</Label>
                    <Input
                      id="lastName"
                      value={form.lastName}
                      onChange={(e) => setForm((f) => ({ ...f, lastName: e.target.value }))}
                      className={cn(errors.lastName && "border-red-500 focus-visible:ring-red-500")}
                      placeholder="Smith"
                    />
                    {errors.lastName && (
                      <div className="text-xs text-red-600">{errors.lastName}</div>
                    )}
                  </div>
                </div>

                <div className="mt-4 space-y-2">
                  <Label htmlFor="email">Work email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                    className={cn(errors.email && "border-red-500 focus-visible:ring-red-500")}
                    placeholder="jane@company.com"
                  />
                  {errors.email && <div className="text-xs text-red-600">{errors.email}</div>}
                </div>

                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="company">Company *</Label>
                    <Input
                      id="company"
                      value={form.company}
                      onChange={(e) => setForm((f) => ({ ...f, company: e.target.value }))}
                      className={cn(errors.company && "border-red-500 focus-visible:ring-red-500")}
                      placeholder="Acme Corp"
                    />
                    {errors.company && (
                      <div className="text-xs text-red-600">{errors.company}</div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="role">Your role *</Label>
                    <Input
                      id="role"
                      value={form.role}
                      onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}
                      className={cn(errors.role && "border-red-500 focus-visible:ring-red-500")}
                      placeholder="Head of Operations"
                    />
                    {errors.role && <div className="text-xs text-red-600">{errors.role}</div>}
                  </div>
                </div>

                <div className="mt-4 space-y-2">
                  <Label htmlFor="message">Anything to prepare? (optional)</Label>
                  <textarea
                    id="message"
                    value={form.message}
                    onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
                    placeholder="Tell us about your use case or questions…"
                    className={cn(
                      "min-h-[96px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm",
                      "placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    )}
                  />
                </div>

                <Button
                  className="mt-6 w-full bg-green-600 text-white hover:bg-green-700"
                  onClick={handleSubmit}
                  disabled={sending || !selectedDate || !selectedTime}
                >
                  {sending ? "Sending confirmation…" : "Confirm Demo Booking"}
                </Button>

                <div className="mt-4 flex items-center justify-center gap-2 text-xs text-muted-foreground">
                  <ShieldCheck className="h-4 w-4" />
                  Your information is secure and never shared.
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {step === "success" && (
          <div className="mx-auto mt-10 max-w-2xl animate-in">
            <div className="text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border bg-green-50 text-green-700">
                <Check className="h-7 w-7" />
              </div>
              <h2 className="mt-4 text-3xl font-extrabold tracking-tight">Demo Confirmed!</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Your session is booked for{" "}
                <span className="font-semibold text-foreground">
                  {selectedDate && selectedTime
                    ? `${monthNames[currentMonth]} ${selectedDate} at ${selectedTime}`
                    : "your selected slot"}
                </span>
                .
              </p>
              <p className="mt-2 text-sm text-muted-foreground">
                A confirmation has been sent to{" "}
                <span className="font-semibold text-green-700">{form.email}</span>.
              </p>
            </div>

            <Card className="mt-6 shadow-sm">
              <CardHeader>
                <CardTitle className="text-base">Booking Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <SummaryRow
                  icon={<CalendarIcon className="h-4 w-4" />}
                  label="Date & time"
                  value={
                    selectedDate && selectedTime
                      ? `${monthNames[currentMonth]} ${selectedDate}, ${currentYear} · ${selectedTime}`
                      : "—"
                  }
                />
                <SummaryRow
                  icon={<Check className="h-4 w-4" />}
                  label="Name"
                  value={`${form.firstName} ${form.lastName}`.trim() || "—"}
                />
                <SummaryRow
                  icon={<Check className="h-4 w-4" />}
                  label="Company"
                  value={
                    form.company || form.role
                      ? `${form.company}${form.company && form.role ? " · " : ""}${form.role}`
                      : "—"
                  }
                />
                <SummaryRow
                  icon={<Mail className="h-4 w-4" />}
                  label="Confirmation"
                  value={form.email || "—"}
                />
              </CardContent>
            </Card>

            <div className="mt-6 flex justify-center bg-green-600 text-white hover:bg-green-700">
              <Button onClick={reset}>Book Another Session</Button>
            </div>

            <div className="mt-10 text-center text-xs text-muted-foreground">
              VERDUSTRY — Questions?{" "}
              <a className="font-medium text-green-700 hover:underline" href="mailto:support@verdustry.com">
                support@verdustry.com
              </a>
            </div>
          </div>
        )}
      </div>
      <Footer/>
    </div>
  );
}

function SummaryRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3 rounded-lg border bg-card p-4">
      <div className="mt-0.5 rounded-md bg-green-50 p-2 text-green-700">{icon}</div>
      <div className="min-w-0">
        <div className="text-xs font-semibold text-muted-foreground">{label}</div>
        <div className="mt-1 truncate text-sm font-semibold">{value}</div>
      </div>
    </div>
  );
}
