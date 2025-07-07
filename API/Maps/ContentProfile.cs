using AutoMapper;

using API.Models;
using API.DTOs;

public class ContentProfile : Profile {
    public ContentProfile() {
        CreateMap<ContentDetail, ContentDetail>()
            .ForMember(d => d.Partial, o => o.Ignore())
            .ForMember(d => d.Genres, o => o.Ignore())
            .ForMember(d => d.Cast, o => o.Ignore())
            .ForMember(d => d.Directors, o => o.Ignore())
            .ForMember(d => d.StreamingOptions, o => o.Ignore());

        CreateMap<ContentDetail, ContentPartial>()
            .ForMember(dest => dest.Detail, opt => opt.Ignore())
            .ForMember(dest => dest.Lists, opt => opt.Ignore());

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