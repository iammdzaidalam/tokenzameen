/**
 * Writes a value into a form control owned by another component without
 * forking that component. The native prototype setter is used so React's value
 * tracker sees a real change, and the events it listens for are dispatched so
 * react-hook-form's registered handlers observe the update.
 */
export function writeFormField(root: ParentNode | null, name: string, value: string): boolean {
  if (!root) return false;
  const control = root.querySelector<HTMLInputElement | HTMLSelectElement>(
    `input[name="${name}"], select[name="${name}"]`,
  );
  if (!control) return false;
  if (control.value === value) return true;

  const prototype =
    control instanceof HTMLSelectElement ? HTMLSelectElement.prototype : HTMLInputElement.prototype;
  const descriptor = Object.getOwnPropertyDescriptor(prototype, "value");
  if (descriptor?.set) descriptor.set.call(control, value);
  else control.value = value;

  control.dispatchEvent(new Event("input", { bubbles: true }));
  control.dispatchEvent(new Event("change", { bubbles: true }));
  return true;
}

export function readFormField(root: ParentNode | null, name: string): string | null {
  if (!root) return null;
  const control = root.querySelector<HTMLInputElement | HTMLSelectElement>(
    `input[name="${name}"], select[name="${name}"]`,
  );
  return control ? control.value : null;
}
