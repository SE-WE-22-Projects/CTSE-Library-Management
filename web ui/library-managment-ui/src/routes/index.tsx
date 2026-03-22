import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
  component: HomeComponent,
})

function HomeComponent() {
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-4xl font-bold">Library UI</h1>
      <p className="text-muted-foreground">Welcome to the Library Management System.</p>
    </div>
  )
}
