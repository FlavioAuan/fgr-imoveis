import type React from "react";
import { Check } from "lucide-react";
import type { Plan } from "@/lib/planTypes";
import { formatPlanPrice } from "@/lib/planTypes";
import { cn } from "@/lib/utils";

interface Props {
  plans: Plan[];
  currentPlanId?: number | null;
  /** Botão ou link de cada cartão */
  action: (plan: Plan, isCurrent: boolean) => React.ReactNode;
}

function limitLabel(plan: Plan): string {
  return plan.maxListings == null ? "Anúncios ilimitados" : `Até ${plan.maxListings} anúncios ativos`;
}

export function PlanCards({ plans, currentPlanId, action }: Props) {
  if (plans.length === 0) {
    return <p className="text-center text-neutral-500 py-12">Nenhum plano disponível no momento.</p>;
  }

  return (
    <div className={cn("grid gap-6", plans.length >= 3 ? "md:grid-cols-3" : plans.length === 2 ? "md:grid-cols-2" : "")}>
      {plans.map(plan => {
        const isCurrent = currentPlanId === plan.id;
        return (
          <div
            key={plan.id}
            className={cn(
              "relative flex flex-col rounded-3xl border bg-white p-7",
              plan.highlighted ? "border-neutral-900 shadow-xl" : "border-neutral-200"
            )}
          >
            {plan.highlighted && (
              <span className="absolute -top-3 left-7 rounded-full bg-neutral-900 px-3 py-1 text-xs font-semibold text-white">
                Mais escolhido
              </span>
            )}
            <h3 className="text-xl font-bold text-neutral-900">{plan.name}</h3>
            {plan.description && <p className="mt-2 text-sm text-neutral-500">{plan.description}</p>}

            <p className="mt-6 text-3xl font-bold text-neutral-900">
              {plan.price === 0 ? "Grátis" : formatPlanPrice(plan.price, plan.billingInterval)}
            </p>
            {plan.trialDays > 0 && (
              <p className="mt-1 text-sm font-medium text-emerald-700">{plan.trialDays} dias grátis para testar</p>
            )}

            <ul className="mt-6 space-y-3 text-sm text-neutral-700 flex-1">
              <li className="flex gap-2.5"><Check size={16} className="mt-0.5 shrink-0 text-emerald-600" />{limitLabel(plan)}</li>
              {plan.features
                .filter(f => !/an[uú]ncios? (ativos|ilimitados)/i.test(f))
                .map(feature => (
                  <li key={feature} className="flex gap-2.5">
                    <Check size={16} className="mt-0.5 shrink-0 text-emerald-600" />
                    {feature}
                  </li>
                ))}
            </ul>

            <div className="mt-8">{action(plan, isCurrent)}</div>
          </div>
        );
      })}
    </div>
  );
}
