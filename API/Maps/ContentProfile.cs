using AutoMapper;

using API.Models;
using API.DTOs;

public class ContentProfile : Profile {
    public ContentProfile() {
        CreateMap<ContentDetail, ContentPartial>()
            .ForMember(dest => dest.Detail, opt => opt.Ignore())  // Prevent cycle
            .ForMember(dest => dest.Lists, opt => opt.Ignore());  // Detail has no lists anyway

        CreateMap<ContentDetail, ContentDTO>();

        CreateMap<ContentDetail, ContentPartialDTO>();

        CreateMap<ContentDetail, ContentSimpleDTO>()
            .ForMember(dest => dest.GenreNames,
                        opt => opt.MapFrom(c => c.Genres.Select(g => g.Name))
            ).ForMember(dest => dest.StreamingServiceNames,
                        opt => opt.MapFrom(c => c.StreamingOptions.Select(o => o.StreamingService.Name))
        );


        CreateMap<ContentPartial, ContentPartialDTO>().ReverseMap();

        CreateMap<ContentPartialDTO, ContentRequestDTO>().ReverseMap();

        CreateMap<Genre, GenreDTO>();
    }
}