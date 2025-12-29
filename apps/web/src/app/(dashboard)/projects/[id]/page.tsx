'use client';

export default function ProjectDetailPage({ params }: { params: { id: string } }) {
  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold mb-2">Project {params.id}</h2>
      <p className="text-gray-600">Project details page placeholder.</p>
    </div>
  );
}
