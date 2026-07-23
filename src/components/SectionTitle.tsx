export default function SectionTitle({ title }: { title: string }) {
  return (
    <div className="w-full overflow-x-hidden pt-5">
      <h2 className="landingSectionTitle relative mx-auto mb-10 max-w-sm pt-4 text-center text-3xl font-bold md:mx-0 md:w-max md:max-w-max md:pt-0 md:text-left">
        {title}
      </h2>
    </div>
  );
}
