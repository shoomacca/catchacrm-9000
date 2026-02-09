import React, { useState } from 'react';
import { Button, IconButton, ButtonGroup, Input, Textarea, Select, Checkbox, RadioGroup, Card, CardHeader, CardBody, CardFooter, Panel } from '../components/ui';
import { Plus, Search, Settings, Trash2, Check, ChevronRight, Mail, Lock, User, Building, Users, Calendar, ExternalLink } from 'lucide-react';

export default function ComponentShowcase() {
  const [loading, setLoading] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [textareaValue, setTextareaValue] = useState('');
  const [selectValue, setSelectValue] = useState('');
  const [checkbox1, setCheckbox1] = useState(false);
  const [checkbox2, setCheckbox2] = useState(true);
  const [radioValue, setRadioValue] = useState('option1');

  return (
    <div className="min-h-screen bg-slate-50 p-12">
      <div className="max-w-6xl mx-auto space-y-12">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Component Library Showcase</h1>
          <p className="text-base text-slate-600">M02A - Design System Implementation</p>
        </div>

        {/* Button Variants */}
        <section className="bg-white rounded-lg p-8 shadow-md">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Button Variants</h2>
          <div className="flex flex-wrap gap-4">
            <Button variant="primary">Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="danger">Danger</Button>
            <Button variant="success">Success</Button>
          </div>
        </section>

        {/* Button Sizes */}
        <section className="bg-white rounded-lg p-8 shadow-md">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Button Sizes</h2>
          <div className="flex flex-wrap items-center gap-4">
            <Button size="sm">Small</Button>
            <Button size="md">Medium</Button>
            <Button size="lg">Large</Button>
          </div>
        </section>

        {/* Buttons with Icons */}
        <section className="bg-white rounded-lg p-8 shadow-md">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Buttons with Icons</h2>
          <div className="flex flex-wrap gap-4">
            <Button icon={<Plus className="h-4 w-4" />} iconPosition="left">
              Add New
            </Button>
            <Button variant="secondary" icon={<Trash2 className="h-4 w-4" />} iconPosition="left">
              Delete
            </Button>
            <Button variant="ghost" icon={<ChevronRight className="h-4 w-4" />} iconPosition="right">
              Continue
            </Button>
          </div>
        </section>

        {/* Loading State */}
        <section className="bg-white rounded-lg p-8 shadow-md">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Loading State</h2>
          <div className="flex flex-wrap gap-4">
            <Button loading>Processing...</Button>
            <Button variant="secondary" onClick={() => setLoading(!loading)} loading={loading}>
              Toggle Loading
            </Button>
          </div>
        </section>

        {/* Icon Buttons */}
        <section className="bg-white rounded-lg p-8 shadow-md">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Icon Buttons</h2>
          <div className="flex flex-wrap items-center gap-4">
            <IconButton icon={<Search className="h-5 w-5" />} label="Search" />
            <IconButton icon={<Settings className="h-5 w-5" />} label="Settings" variant="secondary" />
            <IconButton icon={<Check className="h-5 w-5" />} label="Confirm" variant="primary" />
            <IconButton icon={<Trash2 className="h-5 w-5" />} label="Delete" variant="danger" />
          </div>
        </section>

        {/* Button Groups */}
        <section className="bg-white rounded-lg p-8 shadow-md">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Button Groups</h2>
          <div className="space-y-4">
            <ButtonGroup>
              <Button variant="secondary">Day</Button>
              <Button variant="secondary">Week</Button>
              <Button variant="primary">Month</Button>
            </ButtonGroup>

            <ButtonGroup orientation="vertical">
              <Button variant="ghost" fullWidth>Option 1</Button>
              <Button variant="ghost" fullWidth>Option 2</Button>
              <Button variant="ghost" fullWidth>Option 3</Button>
            </ButtonGroup>
          </div>
        </section>

        {/* States */}
        <section className="bg-white rounded-lg p-8 shadow-md">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">States</h2>
          <div className="flex flex-wrap gap-4">
            <Button>Default</Button>
            <Button disabled>Disabled</Button>
            <Button loading>Loading</Button>
          </div>
        </section>

        {/* Full Width */}
        <section className="bg-white rounded-lg p-8 shadow-md">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Full Width</h2>
          <Button fullWidth>Full Width Button</Button>
        </section>

        {/* Input Components */}
        <section className="bg-white rounded-lg p-8 shadow-md">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Input Components</h2>
          <div className="space-y-6">
            <Input
              label="Email Address"
              placeholder="Enter your email"
              type="email"
              leftIcon={<Mail className="h-4 w-4" />}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.amount)}
              fullWidth
            />
            <Input
              label="Password"
              placeholder="Enter your password"
              type="password"
              leftIcon={<Lock className="h-4 w-4" />}
              helperText="Must be at least 8 characters"
              fullWidth
            />
            <Input
              label="Username (with error)"
              placeholder="Enter username"
              leftIcon={<User className="h-4 w-4" />}
              error="This username is already taken"
              fullWidth
            />
            <div className="grid grid-cols-3 gap-4">
              <Input placeholder="Small" inputSize="sm" />
              <Input placeholder="Medium" inputSize="md" />
              <Input placeholder="Large" inputSize="lg" />
            </div>
          </div>
        </section>

        {/* Textarea Component */}
        <section className="bg-white rounded-lg p-8 shadow-md">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Textarea Component</h2>
          <div className="space-y-6">
            <Textarea
              label="Description"
              placeholder="Enter a detailed description..."
              value={textareaValue}
              onChange={(e) => setTextareaValue(e.target.amount)}
              helperText="Provide as much detail as possible"
              fullWidth
            />
            <Textarea
              label="Non-resizable"
              placeholder="This textarea cannot be resized"
              resize="none"
              rows={3}
              fullWidth
            />
            <Textarea
              label="With Error"
              placeholder="This has an error"
              error="Description is required"
              fullWidth
            />
          </div>
        </section>

        {/* Select Component */}
        <section className="bg-white rounded-lg p-8 shadow-md">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Select Component</h2>
          <div className="space-y-6">
            <Select
              label="Country"
              placeholder="Select a country"
              value={selectValue}
              onChange={(e) => setSelectValue(e.target.amount)}
              options={[
                { value: 'us', label: 'United States' },
                { value: 'uk', label: 'United Kingdom' },
                { value: 'ca', label: 'Canada' },
                { value: 'au', label: 'Australia' },
              ]}
              helperText="Select your country of residence"
              fullWidth
            />
            <div className="grid grid-cols-3 gap-4">
              <Select
                placeholder="Small"
                selectSize="sm"
                options={[
                  { value: '1', label: 'Option 1' },
                  { value: '2', label: 'Option 2' },
                ]}
              />
              <Select
                placeholder="Medium"
                selectSize="md"
                options={[
                  { value: '1', label: 'Option 1' },
                  { value: '2', label: 'Option 2' },
                ]}
              />
              <Select
                placeholder="Large"
                selectSize="lg"
                options={[
                  { value: '1', label: 'Option 1' },
                  { value: '2', label: 'Option 2' },
                ]}
              />
            </div>
            <Select
              label="With Error"
              error="Please select an option"
              options={[
                { value: '1', label: 'Option 1' },
                { value: '2', label: 'Option 2' },
              ]}
              fullWidth
            />
          </div>
        </section>

        {/* Checkbox Component */}
        <section className="bg-white rounded-lg p-8 shadow-md">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Checkbox Component</h2>
          <div className="space-y-6">
            <Checkbox
              label="Accept terms and conditions"
              checked={checkbox1}
              onChange={(e) => setCheckbox1(e.target.checked)}
              helperText="You must accept the terms to continue"
            />
            <Checkbox
              label="Subscribe to newsletter (checked by default)"
              checked={checkbox2}
              onChange={(e) => setCheckbox2(e.target.checked)}
            />
            <Checkbox
              label="Disabled checkbox"
              disabled
              checked={false}
            />
            <div className="space-y-3">
              <p className="text-sm font-bold text-slate-700">Different Sizes:</p>
              <div className="flex flex-col gap-3">
                <Checkbox label="Small checkbox" checkboxSize="sm" />
                <Checkbox label="Medium checkbox" checkboxSize="md" />
                <Checkbox label="Large checkbox" checkboxSize="lg" />
              </div>
            </div>
            <Checkbox
              label="With Error"
              error="You must check this box"
            />
          </div>
        </section>

        {/* Radio Component */}
        <section className="bg-white rounded-lg p-8 shadow-md">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Radio Component</h2>
          <div className="space-y-6">
            <RadioGroup
              name="plan"
              label="Select a plan"
              value={radioValue}
              onChange={setRadioValue}
              options={[
                { value: 'option1', label: 'Free Plan', helperText: 'Perfect for getting started' },
                { value: 'option2', label: 'Pro Plan', helperText: 'For growing teams' },
                { value: 'option3', label: 'Enterprise Plan', helperText: 'For large organizations' },
              ]}
            />
            <RadioGroup
              name="size"
              label="Different Sizes"
              options={[
                { value: 's', label: 'Small' },
                { value: 'm', label: 'Medium' },
                { value: 'l', label: 'Large' },
              ]}
              radioSize="lg"
            />
            <RadioGroup
              name="orientation"
              label="Horizontal Orientation"
              orientation="horizontal"
              options={[
                { value: 'yes', label: 'Yes' },
                { value: 'no', label: 'No' },
                { value: 'maybe', label: 'Maybe' },
              ]}
            />
            <RadioGroup
              name="error"
              label="With Error"
              error="Please select an option"
              options={[
                { value: 'a', label: 'Option A' },
                { value: 'b', label: 'Option B' },
              ]}
            />
          </div>
        </section>

        {/* Card Component - Basic */}
        <section className="bg-white rounded-lg p-8 shadow-md">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Card Component - Basic</h2>
          <div className="grid grid-cols-3 gap-4">
            <Card>
              <h3 className="text-lg font-semibold text-slate-900">Basic Card</h3>
              <p className="text-sm text-slate-600 mt-2">A simple card with default padding, border, and shadow.</p>
            </Card>
            <Card padding="sm">
              <h3 className="text-lg font-semibold text-slate-900">Small Padding</h3>
              <p className="text-sm text-slate-600 mt-2">Card with reduced padding.</p>
            </Card>
            <Card padding="lg">
              <h3 className="text-lg font-semibold text-slate-900">Large Padding</h3>
              <p className="text-sm text-slate-600 mt-2">Card with increased padding.</p>
            </Card>
          </div>
        </section>

        {/* Card Component - Variants */}
        <section className="bg-white rounded-lg p-8 shadow-md">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Card Component - Variants</h2>
          <div className="grid grid-cols-3 gap-4">
            <Card bordered={false}>
              <h3 className="text-lg font-semibold text-slate-900">No Border</h3>
              <p className="text-sm text-slate-600 mt-2">Card without border.</p>
            </Card>
            <Card shadowed={false}>
              <h3 className="text-lg font-semibold text-slate-900">No Shadow</h3>
              <p className="text-sm text-slate-600 mt-2">Card without shadow.</p>
            </Card>
            <Card hover>
              <h3 className="text-lg font-semibold text-slate-900">Hover Effect</h3>
              <p className="text-sm text-slate-600 mt-2">Hover over this card to see the effect.</p>
            </Card>
          </div>
        </section>

        {/* Card Component - Interactive */}
        <section className="bg-white rounded-lg p-8 shadow-md">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Card Component - Interactive</h2>
          <div className="grid grid-cols-2 gap-4">
            <Card as="button" onClick={() => alert('Card clicked!')}>
              <h3 className="text-lg font-semibold text-slate-900">Clickable Card</h3>
              <p className="text-sm text-slate-600 mt-2">Click me! This card acts as a button.</p>
            </Card>
            <Card as="a" href="#" onClick={(e) => e.preventDefault()}>
              <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                Link Card
                <ExternalLink className="h-4 w-4" />
              </h3>
              <p className="text-sm text-slate-600 mt-2">This card is rendered as a link element.</p>
            </Card>
          </div>
        </section>

        {/* Card Component - Composed */}
        <section className="bg-white rounded-lg p-8 shadow-md">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Card Component - Composed</h2>
          <div className="grid grid-cols-2 gap-6">
            <Card padding="none">
              <CardHeader
                title="Company Profile"
                subtitle="View and edit company information"
                icon={<Building className="h-5 w-5" />}
                padding="md"
              />
              <CardBody padding="md" divider>
                <p className="text-sm text-slate-600">
                  This card uses the CardHeader and CardBody subcomponents to create a structured layout
                  with clear visual hierarchy.
                </p>
              </CardBody>
            </Card>

            <Card padding="none">
              <CardHeader
                title="Team Members"
                subtitle="12 active members"
                icon={<Users className="h-5 w-5" />}
                actions={
                  <IconButton
                    icon={<Plus className="h-4 w-4" />}
                    label="Add member"
                    variant="primary"
                    size="sm"
                  />
                }
                padding="md"
              />
              <CardBody padding="md" divider>
                <p className="text-sm text-slate-600 mb-4">Manage your team members and their roles.</p>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold">
                      JD
                    </div>
                    <span className="font-medium">John Doe</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center text-green-600 font-semibold">
                      JS
                    </div>
                    <span className="font-medium">Jane Smith</span>
                  </div>
                </div>
              </CardBody>
              <CardFooter padding="md" bordered align="space-between">
                <Button variant="ghost" size="sm">Cancel</Button>
                <Button variant="primary" size="sm">Save Changes</Button>
              </CardFooter>
            </Card>
          </div>
        </section>

        {/* Card Component - Full Width */}
        <section className="bg-white rounded-lg p-8 shadow-md">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Card Component - Full Width</h2>
          <Card fullWidth padding="none">
            <CardHeader
              title="Upcoming Events"
              subtitle="3 events scheduled this week"
              icon={<Calendar className="h-5 w-5" />}
              actions={
                <Button variant="ghost" size="sm" icon={<Plus className="h-4 w-4" />}>
                  Add Event
                </Button>
              }
              padding="lg"
            />
            <CardBody padding="lg" divider>
              <div className="space-y-4">
                <div className="flex justify-between items-start p-4 bg-slate-50 rounded-lg">
                  <div>
                    <h4 className="font-semibold text-slate-900">Team Meeting</h4>
                    <p className="text-sm text-slate-600">Monday, 10:00 AM</p>
                  </div>
                  <Button variant="ghost" size="sm">View</Button>
                </div>
                <div className="flex justify-between items-start p-4 bg-slate-50 rounded-lg">
                  <div>
                    <h4 className="font-semibold text-slate-900">Client Call</h4>
                    <p className="text-sm text-slate-600">Wednesday, 2:00 PM</p>
                  </div>
                  <Button variant="ghost" size="sm">View</Button>
                </div>
              </div>
            </CardBody>
          </Card>
        </section>

        {/* Panel Component - Basic */}
        <section className="bg-white rounded-lg p-8 shadow-md">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Panel Component - Basic</h2>
          <div className="space-y-4">
            <Panel
              title="Default Panel"
              subtitle="This is a basic panel with default styling"
            >
              <p className="text-sm text-slate-600">
                Panels are larger content containers, typically used for sections or groupings of related information.
              </p>
            </Panel>
          </div>
        </section>

        {/* Panel Component - Variants */}
        <section className="bg-white rounded-lg p-8 shadow-md">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Panel Component - Variants</h2>
          <div className="space-y-4">
            <Panel
              title="Default Variant"
              variant="default"
            >
              <p className="text-sm text-slate-600">Panel with default variant (standard border).</p>
            </Panel>
            <Panel
              title="Bordered Variant"
              variant="bordered"
            >
              <p className="text-sm text-slate-600">Panel with bordered variant (thicker border).</p>
            </Panel>
            <Panel
              title="Elevated Variant"
              variant="elevated"
            >
              <p className="text-sm text-slate-600">Panel with elevated variant (shadow for depth).</p>
            </Panel>
          </div>
        </section>

        {/* Panel Component - Collapsible */}
        <section className="bg-white rounded-lg p-8 shadow-md">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Panel Component - Collapsible</h2>
          <div className="space-y-4">
            <Panel
              title="Collapsible Panel (Expanded by Default)"
              subtitle="Click the chevron to collapse"
              icon={<Settings className="h-5 w-5" />}
              collapsible
              defaultExpanded={true}
            >
              <p className="text-sm text-slate-600 mb-4">
                This panel can be collapsed and expanded. It starts in an expanded state.
              </p>
              <div className="space-y-2">
                <Input label="Setting 1" placeholder="Enter value" fullWidth />
                <Input label="Setting 2" placeholder="Enter value" fullWidth />
              </div>
            </Panel>
            <Panel
              title="Collapsible Panel (Collapsed by Default)"
              subtitle="Click the chevron to expand"
              icon={<Users className="h-5 w-5" />}
              collapsible
              defaultExpanded={false}
            >
              <p className="text-sm text-slate-600">
                This panel starts in a collapsed state. Click the header to expand it.
              </p>
            </Panel>
          </div>
        </section>

        {/* Panel Component - With Footer */}
        <section className="bg-white rounded-lg p-8 shadow-md">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Panel Component - With Footer</h2>
          <Panel
            title="Settings Panel"
            subtitle="Configure your preferences"
            icon={<Settings className="h-5 w-5" />}
            footer={
              <div className="flex justify-end gap-2">
                <Button variant="ghost">Reset</Button>
                <Button variant="primary">Save Changes</Button>
              </div>
            }
          >
            <div className="space-y-4">
              <Checkbox label="Enable notifications" />
              <Checkbox label="Enable email alerts" />
              <Checkbox label="Enable dark mode" />
            </div>
          </Panel>
        </section>

        {/* Panel Component - With Actions */}
        <section className="bg-white rounded-lg p-8 shadow-md">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Panel Component - With Header Actions</h2>
          <Panel
            title="Data Management"
            subtitle="Import and export your data"
            icon={<Building className="h-5 w-5" />}
            headerActions={
              <div className="flex gap-2">
                <Button variant="ghost" size="sm">Import</Button>
                <Button variant="ghost" size="sm">Export</Button>
              </div>
            }
            variant="elevated"
          >
            <div className="space-y-4">
              <p className="text-sm text-slate-600">
                Use the actions in the header to import or export your data. All operations are logged for audit purposes.
              </p>
              <div className="p-4 bg-slate-50 rounded-lg">
                <p className="text-xs font-medium text-slate-700">Last export: 2 days ago</p>
                <p className="text-xs text-slate-600 mt-1">Format: CSV</p>
              </div>
            </div>
          </Panel>
        </section>
      </div>
    </div>
  );
}
