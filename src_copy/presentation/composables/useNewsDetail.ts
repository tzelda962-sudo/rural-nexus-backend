import { useAsyncData } from "#imports";
import { GetNewsDetailUseCase } from "../../application/use_cases/GetNewsDetailUseCase";
import { MockNewsEventRepository } from "../../infrastructure/repositories/MockNewsEventRepository";
import { useRoute } from "vue-router";

export default function useNewsDetail(id: string) {
  const useCase = new GetNewsDetailUseCase(new MockNewsEventRepository());
  return useAsyncData(`news-${id}`, () => useCase.execute(id));
}
