export default function remove(values: any[]): any[] {
  return [...new Set(values)]
}
