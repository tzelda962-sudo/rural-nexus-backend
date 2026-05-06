import { getPayload } from 'payload'
import config from '../payload.config'

const publications = [
  {
    title: 'Innovation Support Service Characterization: The Cassava Sub-sector in Cameroon',
    externalUrl: 'https://www.researchgate.net/publication/358983129_Innovation_Support_Service_Characterization_The_Cassava_Sub-sector_in_Cameroon',
  },
  {
    title: 'Adoption and adaptation of innovations',
    externalUrl: 'https://www.researchgate.net/publication/279827858_Adoption_and_adaptation_of_innovations',
  },
  {
    title: 'Agroecology and Sustainable Food Systems: Analysis of agroecological transition and adoption potential in two contrasting regions of Burkina Faso using comparative participatory assessment tools',
    externalUrl: 'https://www.researchgate.net/publication/394430414_Agroecology_and_Sustainable_Food_Systems_Analysis_of_agroecological_transition_and_adoption_potential_in_two_contrasting_regions_of_Burkina_Faso_using_comparative_participatory_assessment_tools',
  },
  {
    title: 'INCAA: INnovative Conservation Agriculture Approaches Food Security and Climate Action through Soil and Water Conservation',
    externalUrl: 'https://www.researchgate.net/publication/283508741_INCAA_-_INnovative_Conservation_Agriculture_Approaches_Food_Security_and_Climate_Action_through_Soil_and_Water_Conservation',
  },
  {
    title: "Stakeholders' perceptions on sustainability transition pathways of the cocoa value chain towards improved livelihood of small-scale farming households in Cameroon",
    externalUrl: 'https://www.researchgate.net/publication/338353562_Stakeholders\'_perceptions_on_sustainability_transition_pathways_of_the_cocoa_value_chain_towards_improved_livelihood_of_small-scale_farming_households_in_Cameroon',
  },
  {
    title: 'Factors Affecting the Adoption of Forage Technologies in Smallholder Dairy Production Systems in Lushoto, Tanzania',
    externalUrl: 'https://www.researchgate.net/publication/322102895_Factors_Affecting_the_Adoption_of_Forage_Technologies_in_Smallholder_Dairy_Production_Systems_in_Lushoto_Tanzania',
  },
  {
    title: "Trans-SEC's food security research in Tanzania from constraints to adoption for out- and upscaling of agricultural innovations",
    externalUrl: 'https://www.researchgate.net/publication/326779114_Trans-SEC\'s_food_security_research_in_Tanzania_from_constraints_to_adoption_for_out-_and_upscaling_of_agricultural_innovations',
  },
  {
    title: 'Agricultural risk assessment to enhance the food systems of the Mbororo minority community in the Northwest region of Cameroon',
    externalUrl: 'https://www.researchgate.net/publication/355792839_Agricultural_risk_assessment_to_enhance_the_food_systems_of_the_Mbororo_minority_community_in_the_Northwest_region_of_Cameroon',
  },
  {
    title: "Guidelines for applying the methodology and tools for characterising innovation support services (ISS) and innovation support providers' ISP: SERVInnov project",
    externalUrl: 'https://www.researchgate.net/publication/341510415_Guidelines_for_applying_the_methodology_and_tools_for_characterising_innovation_support_services_ISS_and_innovation_support_providers\'_ISP_SERVInnov_project',
  },
  {
    title: 'The MEA-Scope modelling approach',
    externalUrl: 'https://www.researchgate.net/publication/260844829_The_MEA-Scope_modelling_approach',
  },
  {
    title: 'From adoption potential to transformative learning around Conservation Agriculture in Burkina Faso Tropentag 2017 Future Agriculture social-ecological transitions and bio-cultural shifts',
    externalUrl: 'https://www.researchgate.net/publication/320165817_From_adoption_potential_to_transformative_learning_around_Conservation_Agriculture_in_Burkina_Faso_Tropentag_2017_Future_Agriculture_social-ecological_transitions_and_bio-cultural_shifts',
  },
  {
    title: 'Which place of agricultural advisory services among innovation support services in Madagascar?',
    externalUrl: 'https://www.researchgate.net/publication/356283250_Which_place_of_agricultural_advisory_services_among_innovation_support_services_in_Madagascar',
  },
  {
    title: 'Coping and Social Cohesion Mechanisms in Addressing Climate Change and Land Degradation in Ghana',
    externalUrl: 'https://www.researchgate.net/publication/384078779_Coping_and_Social_Cohesion_Mechanisms_in_Addressing_Climate_Change_and_Land_Degradation_in_Ghana',
  },
  {
    title: 'Analysis of advisory services for agroecological transformation in Central Africa',
    externalUrl: 'https://www.researchgate.net/publication/385619216_Analysis_of_advisory_services_for_agroecological_transformation_in_Central_Africa',
  },
  {
    title: 'Assessing regional performance of agroecology: comparing two contrasting case studies in Burkina Faso Agricultural Landscape Systems',
    externalUrl: 'https://www.researchgate.net/publication/384080108_Assessing_regional_performance_of_agroecology_-_comparing_two_contrasting_case_studies_in_Burkina_Faso_Agricultural_Landscape_Systems',
  },
  {
    title: 'Multi-actor interaction and coordination in the development of a territorial innovation project some insights from the Cilento Bio-district in Italy',
    externalUrl: 'https://www.researchgate.net/publication/327039506_Multi-actor_interaction_and_coordination_in_the_development_of_a_territorial_innovation_project_some_insights_from_the_Cilento_Bio-district_in_Italy',
  },
  {
    title: 'A Qualitative expert Assessment Tool QAToCA for assessing the adoption of Conservation Agriculture in Africa selected application in Kenya and Tanzania',
    externalUrl: 'https://www.researchgate.net/publication/260172276_A_Qualitative_expert_Assessment_Tool_QAToCA_for_assessing_the_adoption_of_Conservation_Agriculture_in_Africa_selected_application_in_Kenya_and_Tanzania',
  },
  {
    title: "Fish Pond Aquaculture in Cameroon: A Field Survey of Determinants for Farmers' Adoption Behaviour",
    externalUrl: 'https://www.researchgate.net/publication/254231456_Fish_Pond_Aquaculture_in_Cameroon_A_Field_Survey_of_Determinants_for_Farmers\'_Adoption_Behaviour',
  },
  {
    title: 'Co-creation of agroecological practices combinations in agroecology living labs',
    externalUrl: 'https://www.researchgate.net/publication/384079774_Co-creation_of_agroecological_practices_combinations_in_agroecology_living_labs',
  },
  {
    title: 'Mapping Agroecology Networks in Burkina Faso Governance: Challenges and Pathways for Transition',
    externalUrl: 'https://www.researchgate.net/publication/397853202_Mapping_Agroecology_Networks_in_Burkina_Faso_Governance_Challenges_and_Pathways_for_Transition',
  },
  {
    title: 'Introduction to a Special Issue Regional Food and Nutritional Security in Tanzania-Methods Tools and Applications',
    externalUrl: 'https://www.researchgate.net/publication/322077960_Introduction_to_a_Special_Issue_Regional_Food_and_Nutritional_Security_in_Tanzania-Methods_Tools_and_Applications',
  },
  {
    title: "Improving innovation support services in AIS exploring innovative farmers and providers' perceptions of service quality in Madagascar",
    externalUrl: 'https://www.researchgate.net/publication/391434288_Improving_innovation_support_services_in_AIS_exploring_innovative_farmers_and_providers\'_perceptions_of_service_quality_in_Madagascar',
  },
  {
    title: 'CA2AFRICA Conservation Agriculture in Africa Analyzing and foreseeing its impact: Comprehending its adoption',
    externalUrl: 'https://www.researchgate.net/publication/283390999_CA2AFRICA_Conservation_Agriculture_in_Africa_Analyzing_and_foreseeing_its_impact_-_Comprehending_its_adoption',
  },
  {
    title: 'Co-desigend Methodological Framework and Guidelines for in-depth Case Study: Analysis SERVInnov project',
    externalUrl: 'https://www.researchgate.net/publication/344428404_Co-desigend_Methodological_Framework_and_Guidelines_for_in-depth_Case_Study_Analysis_SERVInnov_project',
  },
  {
    title: 'Assessing nutrient inadequacies and influence of socio-economic characteristics on diet quality of the Mbororo minority women in Northwest Cameroon',
    externalUrl: 'https://www.researchgate.net/publication/344428917_Assessing_nutrient_inadequacies_and_influence_of_socio-economic_characteristics_on_diet_quality_of_the_Mbororo_minority_women_in_Northwest_Cameroon',
  },
  {
    title: 'An organizational capacity self-assessment for innovation support service providers OCATI -approach and results from application in Madagascar',
    externalUrl: 'https://www.researchgate.net/publication/393774176_An_organizational_capacity_self-assessment_for_innovation_support_service_providers_OCATI_-approach_and_results_from_application_in_Madagascar',
  },
  {
    title: "Strengthening womens and youths' access to innovation support services ISS: The 24 h' cassava retting case in Cameroon",
    externalUrl: 'https://www.researchgate.net/publication/364352780_Strengthening_womens_and_youths\'_access_to_innovation_support_services_ISS_The_24_h\'_cassava_retting_case_in_Cameroon',
  },
  {
    title: 'Factors Affecting the Adoption of Forage Technologies under Smallholder Dairy Production Systems in Tanzania',
    externalUrl: 'https://www.researchgate.net/publication/320164838_Factors_Affecting_the_Adoption_of_Forage_Technologies_under_Smallholder_Dairy_Production_Systems_in_Tanzania',
  },
  {
    title: 'From dogmatic views on conservation agriculture adoption in Zambia towards adapting to context',
    externalUrl: 'https://www.researchgate.net/publication/323638712_From_dogmatic_views_on_conservation_agriculture_adoption_in_Zambia_towards_adapting_to_context',
  },
  {
    title: 'Evolution des pratiques agricoles endogenes dans les communes rurales du nord du Burkina Faso',
    externalUrl: 'https://www.researchgate.net/publication/389174339_Evolution_des_pratiques_agricoles_endogenes_dans_les_communes_rurales_du_nord_du_Burkina_Faso',
  },
  {
    title: 'Relating innovation support services (ISS) with innovation processes lessons from the: AgriSpin project',
    externalUrl: 'https://www.researchgate.net/publication/332014758_Relating_innovation_support_services_ISS_with_innovation_processes_lessons_from_the_AgriSpin_project',
  },
  {
    title: 'Methodological guide for Documentation and Selection of innovation cases: Case of: AgriSpin project',
    externalUrl: 'https://www.researchgate.net/publication/332015048_Methodological_guide_for_Documentation_and_Selection_of_innovation_cases_-_Case_of_AgriSpin_project',
  },
  {
    title: "Conservation Agriculture in Zambia: an invention fast becoming an innovation assessing pre-conditions for farmers' adaptation and adoption behaviour using QAToCA",
    externalUrl: 'https://www.researchgate.net/publication/282278759_Conservation_Agriculture_in_Zambia_-_an_invention_fast_becoming_an_innovation_assessing_pre-conditions_for_farmers\'_adaptation_and_adoption_behaviour_using_QAToCA',
  },
  {
    title: 'Integrated assessment of sustainable agricultural practices to enhance climate resilience in Morogoro, Tanzania',
    externalUrl: 'https://www.researchgate.net/publication/276919245_Integrated_assessment_of_sustainable_agricultural_practices_to_enhance_climate_resilience_in_Morogoro_Tanzania',
  },
  {
    title: 'Coping and social cohesion mechanisms in addressing climate change and land degradation in Ghana',
    externalUrl: 'https://www.researchgate.net/publication/395409300_Coping_and_social_cohesion_mechanisms_in_addressing_climate_change_and_land_degradation_in_Ghana',
  },
  {
    title: 'Actors networks and platforms for the promotion of agro-ecological practices in Burkina Faso',
    externalUrl: 'https://www.researchgate.net/publication/372104020_Actors_networks_and_platforms_for_the_promotion_of_agro-ecological_practices_in_Burkina_Faso',
  },
  {
    title: "Guide pour l'outil d'evaluation de la capacite organisationnelle pour le soutien a l'innovation OCATI titre original Un outil co-concu pour l'auto-evaluation des capacites des organisations a fournir",
    externalUrl: 'https://www.researchgate.net/publication/367048779_Guide_pour_l\'outil_d\'evaluation_de_la_capacite_organisationnelle_pour_le_soutien_a_l\'innovation_OCATI_titre_original_Un_outil_co-concu_pour_l\'auto-evaluation_des_capacites_des_organisations_a_fournir_',
  },
  {
    title: 'Pluralism of agricultural advisory service providers: Facts and insights from Europe',
    externalUrl: 'https://www.researchgate.net/publication/318771303_Pluralism_of_agricultural_advisory_service_providers_-_Facts_and_insights_from_Europe',
  },
  {
    title: 'A scientific report on cross-compared research insights on Innovation Support Practices',
    externalUrl: 'https://www.researchgate.net/publication/344439583_A_scientific_report_on_cross-compared_research_insights_on_Innovation_Support_Practices',
  },
  {
    title: "Towards a framework to assess quality of innovation support services in AKIS match and mismatch between farmers and providers' perceptions in Madagascar",
    externalUrl: 'https://www.researchgate.net/publication/375792955_Towards_a_framework_to_assess_quality_of_innovation_support_services_in_AKIS_match_and_mismatch_between_farmers_and_providers\'_perceptions_in_Madagascar',
  },
  {
    title: 'Understanding the conditions of conservation agriculture adoption in Lango region Uganda',
    externalUrl: 'https://www.researchgate.net/publication/340792258_Understanding_the_conditions_of_conservation_agriculture_adoption_in_Lango_region_Uganda',
  },
  {
    title: 'HOW TO STRENGTHEN INNOVATION SUPPORT SERVICES IN AGRICULTURE WITH REGARD TO MULTI-STAKEHOLDER APPROACHES?',
    externalUrl: 'https://www.researchgate.net/publication/330934185_HOW_TO_STRENGTHEN_INNOVATION_SUPPORT_SERVICES_IN_AGRICULTURE_WITH_REGARD_TO_MULTI-STAKEHOLDER_APPROACHES',
  },
  {
    title: 'How to Strengthen Innovation Support Services in European Rural Areas: Lessons Learnt from AgriSpin?',
    externalUrl: 'https://www.researchgate.net/publication/324586194_How_to_Strengthen_Innovation_Support_Services_in_European_Rural_Areas_Lessons_Learnt_from_AgriSpin',
  },
  {
    title: 'Adoption potential for sustainable small-scale irrigation with solar pumps in Burkina Faso Agricultural Landscape Systems',
    externalUrl: 'https://www.researchgate.net/publication/374951983_Adoption_potential_for_sustainable_small-scale_irrigation_with_solar_pumps_in_Burkina_Faso_Agricultural_Landscape_Systems',
  },
  {
    title: 'Adoption and Diffusion of Fish Pond Aquaculture in Cameroon: An empirical study carried out in the Centre Southwest and Northwest Provinces of Cameroon',
    externalUrl: 'https://www.researchgate.net/publication/260843856_Adoption_and_Diffusion_of_Fish_Pond_Aquaculture_in_Cameroon_An_empirical_study_carried_out_in_the_Centre_Southwest_and_Northwest_Provinces_of_Cameroon',
  },
  {
    title: 'Understanding the impact and adoption of conservation agriculture in Africa: A multi-scale analysis',
    externalUrl: 'https://www.researchgate.net/publication/259119032_Understanding_the_impact_and_adoption_of_conservation_agriculture_in_Africa_A_multi-scale_analysis',
  },
  {
    title: 'Socio-psychological determinants of biopesticide adoption among smallholder farmers in Huambo Province, Angola',
    externalUrl: 'https://www.researchgate.net/publication/394428799_Socio-psychological_determinants_of_biopesticide_adoption_among_smallholder_farmers_in_Huambo_province_Angola',
  },
  {
    title: 'Diversity of innovation support services and influence on innovation processes in Europe: Lessons from the: AgriSpin project',
    externalUrl: 'https://www.researchgate.net/publication/327039491_Diversity_of_innovation_support_services_and_influence_on_innovation_processes_in_Europe_-_Lessons_from_the_AgriSpin_project',
  },
  {
    title: 'A socioeconomic analysis of the zai farming practice in northern Burkina Faso',
    externalUrl: 'https://www.researchgate.net/publication/308801732_A_socioeconomic_analysis_of_the_zai_farming_practice_in_northern_Burkina_Faso',
  },
  {
    title: "Farmers' perception on the effects of interactive training and on-farm testing of Seedball technology for enhancing adoption -Maradi Region, Niger",
    externalUrl: 'https://www.researchgate.net/publication/374952055_Farmers\'_perception_on_the_effects_of_interactive_training_and_on-farm_testing_of_Seedball_technology_for_enhancing_adoption_-Maradi_region_Niger',
  },
  {
    title: 'How to strengthen innovation support services in agriculture with regard to multistakeholder approaches pre-publication?',
    externalUrl: 'https://www.researchgate.net/publication/329399546_How_to_strengthen_innovation_support_services_in_agriculture_with_regard_to_multistakeholder_approaches_pre-publication',
  },
  {
    title: 'How to strengthen innovation support services in agriculture with regard to multi-stakeholder approaches?',
    externalUrl: 'https://www.researchgate.net/publication/341662029_How_to_strengthen_innovation_support_services_in_agriculture_with_regard_to_multi-stakeholder_approaches',
  },
  {
    title: "Determinants for Smallholder Farmers' Adoption of Improved Forages in Dairy Production Systems: The Case of Tanga Region Tanzania",
    externalUrl: 'https://www.researchgate.net/publication/358106952_Determinants_for_Smallholder_Farmers\'_Adoption_of_Improved_Forages_in_Dairy_Production_Systems_The_Case_of_Tanga_Region_Tanzania',
  },
  {
    title: 'From technical advisory to innovation support services coexistence and transition of support models in the agricultural sector in Madagascar',
    externalUrl: 'https://www.researchgate.net/publication/389155527_From_technical_advisory_to_innovation_support_services_coexistence_and_transition_of_support_models_in_the_agricultural_sector_in_Madagascar',
  },
  {
    title: 'Adoption Potential of Conservation Agriculture in Sub-Saharan Africa',
    externalUrl: 'https://www.researchgate.net/publication/260172955_Adoption_Potential_of_Conservation_Agriculture_in_Sub-Saharan_Africa',
  },
  {
    title: 'Impact of Sustainable Agricultural Innovations on Food and Nutrition Security in Sub-Saharan Africa',
    externalUrl: 'https://www.researchgate.net/publication/403673285_Impact_of_Sustainable_Agricultural_Innovations_on_Food_and_Nutrition_Security_in_Sub-Saharan_Africa',
  },
  {
    title: 'From adoption potential to Transformative Learning around Conservation Agriculture',
    externalUrl: 'https://www.researchgate.net/publication/327860796_From_adoption_potential_to_Transformative_Learning_around_Conservation_Agriculture',
  },
  {
    title: 'Adoption Potential for Conservation Agriculture in Africa: A Newly Developed Assessment Approach QAToCA Applied in Kenya and Tanzania',
    externalUrl: 'https://www.researchgate.net/publication/259866326_Adoption_Potential_for_Conservation_Agriculture_in_Africa_A_Newly_Developed_Assessment_Approach_QAToCA_Applied_in_Kenya_and_Tanzania',
  },
  {
    title: 'Dynamics and diversity of innovation support services especially networking service activities on selected agro- food innovation cases in Madagascar and Burkina Faso',
    externalUrl: 'https://www.researchgate.net/publication/372103591_Dynamics_and_diversity_of_innovation_support_services_especially_networking_service_activities_on_selected_agro-_food_innovation_cases_in_Madagascar_and_Burkina_Faso',
  },
  {
    title: "Trans-SEC's food security research in Tanzania principles research models and assumptions",
    externalUrl: 'https://www.researchgate.net/publication/322078072_Trans-SEC\'s_food_security_research_in_Tanzania_principles_research_models_and_assumptions',
  },
  {
    title: "Improving farmers' livelihoods through conservation agriculture options for change promotion in Laikipia",
    externalUrl: 'https://www.researchgate.net/publication/340284856_Improving_farmers\'_livelihoods_through_conservation_agriculture_options_for_change_promotion_in_Laikipia',
  },
  {
    title: 'Adoption and adaptation of innovations: assessing the diffusion of selected agricultural innovations in Africa',
    externalUrl: 'https://www.researchgate.net/publication/265470913_Adoption_and_adaptation_of_innovations_-_assessing_the_diffusion_of_selected_agricultural_innovations_in_Africa',
  },
  {
    title: 'Potential farm to landscape level impact and adoption of forage technologies in smallholder dairy production systems in Tanga, Tanzania',
    externalUrl: 'https://www.researchgate.net/publication/308802582_Potential_farm_to_landscape_level_impact_and_adoption_of_forage_technologies_in_smallholder_dairy_production_systems_in_Tanga_Tanzania',
  },
  {
    title: "Guide for Organisational Capacity Assessment Tool for Innovation support OCATI SERVInnov's D14 Guide for Organisational Capacity Assessment Tool for Innovation support OCATI original title: A Co-design",
    externalUrl: 'https://www.researchgate.net/publication/367048506_Guide_for_Organisational_Capacity_Assessment_Tool_for_Innovation_support_OCATI_SERVInnov\'s_D14_Guide_for_Organisational_Capacity_Assessment_Tool_for_Innovation_support_OCATI_original_title_A_Co-design',
  },
  {
    title: 'Organisational Capacity Assessment for Innovation Support approach and results from tool applications in Cameroon and Madagascar',
    externalUrl: 'https://www.researchgate.net/publication/374951947_Organisational_Capacity_Assessment_for_Innovation_Support_approach_and_results_from_tool_applications_in_Cameroon_and_Madagascar',
  },
  {
    title: "Quelle place du conseil agricole dans les services support a l'innovation a Madagascar",
    externalUrl: 'https://www.researchgate.net/publication/353332409_Quelle_place_du_conseil_agricole_dans_les_services_support_a_l\'innovation_a_Madagascar',
  },
  {
    title: 'Adoption Potential of Conservation Agriculture Practices in Sub-Saharan Africa: Results from Five Case Studies',
    externalUrl: 'https://www.researchgate.net/publication/259321599_Adoption_Potential_of_Conservation_Agriculture_Practices_in_Sub-Saharan_Africa_Results_from_Five_Case_Studies',
  },
  {
    title: 'Unseen catalyst How networking facilitation and brokerage drive agri-food innovation amidst growing innovation support service diversification in the global south',
    externalUrl: 'https://www.researchgate.net/publication/390555174_Unseen_catalyst_How_networking_facilitation_and_brokerage_drive_agri-food_innovation_amidst_growing_innovation_support_service_diversification_in_the_global_south',
  },
  {
    title: 'Feeding the soil AND feeding the cow: Conservation Agriculture in Kenya Future Agriculture social-ecological transitions and bio-cultural shifts',
    externalUrl: 'https://www.researchgate.net/publication/320165755_Feeding_the_soil_AND_feeding_the_cow_-_Conservation_Agriculture_in_Kenya_Future_Agriculture_social-ecological_transitions_and_bio-cultural_shifts',
  },
  {
    title: 'Influencing factors for adoption of forage technologies in smallholder dairy systems in Lushoto, Tanzania',
    externalUrl: 'https://www.researchgate.net/publication/308801748_Influencing_factors_for_adoption_of_forage_technologies_in_smallholder_dairy_systems_in_Lushoto_Tanzania',
  },
]

function slugify(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .slice(0, 96)
}

async function seed() {
  const payload = await getPayload({ config })

  for (const pub of publications) {
    const slug = slugify(pub.title)
    const existing = await payload.find({
      collection: 'publications',
      where: { slug: { equals: slug } },
      limit: 1,
    })

    if (existing.docs.length > 0) {
      payload.logger.info(`[seed] skip — already exists: ${slug}`)
      continue
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await payload.create({ collection: 'publications', data: { ...pub, slug, publicationType: 'external' } as any })
    payload.logger.info(`[seed] created: ${slug}`)
  }

  payload.logger.info('[seed] researchgate publications done')
  process.exit(0)
}

seed().catch((err) => {
  console.error(err)
  process.exit(1)
})
