import CountForm from "@/components/CountForm";
import { getCountDoc } from "@/lib/movies";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Count Submit",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function CountPage() {
  let randomData = 1;
  let randomCount = 0;

  try {
    const doc = await getCountDoc();
    randomData = doc.randomData;
    randomCount = doc.randomCount;
  } catch (error) {
    console.error("Count page error:", error);
  }

  return (
    <div className="count-page-wrap">
      <CountForm initialCount={randomCount} initialRandom={randomData} />
    </div>
  );
}
